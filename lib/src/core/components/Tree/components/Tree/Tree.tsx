import React, { Component, ReactNode } from 'react';
import {
  Draggable,
  Droppable,
  DragDropContext,
  DragStart,
  DropResult,
  DragUpdate,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
} from 'react-beautiful-dnd';
import { getBox } from 'css-box-model';
import { calculateFinalDropPositions } from './Tree-utils';
import { Props, State, DragState } from './Tree-types';
import { noop } from '../../utils/handy';
import { flattenTree, mutateTree } from '../../utils/tree';
import { FlattenedItem, ItemId, Path, TreeData } from '../../types';
import TreeItem from '../TreeItem';
import {
  getDestinationPath,
  getItemById,
  getIndexById,
} from '../../utils/flat-tree';
import DelayedFunction from '../../utils/delayed-function';

export default class Tree extends Component<Props, State> {
  static defaultProps = {
    tree: { children: [] },
    onExpand: noop,
    onCollapse: noop,
    onDragStart: noop,
    onDragEnd: noop,
    renderItem: noop,
    offsetPerLevel: 35,
    isDragEnabled: false,
    isNestingEnabled: false,
  };

  state = {
    flattenedTree: [],
    draggedItemId: undefined,
  };

  // State of dragging.
  dragState?: DragState;

  // HTMLElement for each rendered item
  itemsElement: Record<ItemId, HTMLElement | undefined> = {};

  // HTMLElement of the container element
  containerElement: HTMLElement | undefined;

  expandTimer = new DelayedFunction(500);

  static getDerivedStateFromProps(props: Props, state: State) {
    const { draggedItemId } = state;
    const { tree } = props;

    const finalTree: TreeData = Tree.closeParentIfNeeded(tree, draggedItemId);
    const flattenedTree = flattenTree(finalTree);

    return {
      ...state,
      flattenedTree,
    };
  }

  static closeParentIfNeeded(tree: TreeData, draggedItemId?: ItemId): TreeData {
    if (draggedItemId) {
      // Closing parent internally during dragging, because visually we can only move one item not a subtree
      return mutateTree(tree, draggedItemId, {
        isExpanded: false,
      });
    }
    return tree;
  }

  onDragStart = (result: DragStart) => {
    const { onDragStart } = this.props;
    this.dragState = {
      source: result.source,
      destination: result.source,
      mode: result.mode,
    };
    this.setState({
      draggedItemId: result.draggableId,
    });
    if (onDragStart) {
      onDragStart(result.draggableId);
    }
  };

  onDragUpdate = (update: DragUpdate) => {
    const { onExpand } = this.props;
    const { flattenedTree } = this.state;
    if (!this.dragState) {
      return;
    }

    this.expandTimer.stop();
    if (update.combine) {
      const { draggableId } = update.combine;
      const item: FlattenedItem | undefined = getItemById(
        flattenedTree,
        draggableId,
      );
      if (item && this.isExpandable(item)) {
        this.expandTimer.start(() => onExpand(draggableId, item.path));
      }
    }
    this.dragState = {
      ...this.dragState,
      destination: update.destination,
      combine: update.combine,
    };
  };

  onDropAnimating = () => {
    this.expandTimer.stop();
  };

  onDragEnd = (result: DropResult) => {
    const { onDragEnd, tree } = this.props;
    const { flattenedTree } = this.state;
    this.expandTimer.stop();

    const finalDragState: DragState = {
      ...this.dragState!,
      source: result.source,
      destination: result.destination,
      combine: result.combine,
    };

    this.setState({
      draggedItemId: undefined,
    });

    const { sourcePosition, destinationPosition } = calculateFinalDropPositions(
      tree,
      flattenedTree,
      finalDragState,
    );

    onDragEnd(sourcePosition, destinationPosition);

    this.dragState = undefined;
  };

  onPointerMove = () => {
    if (this.dragState) {
      this.dragState = {
        ...this.dragState,
        horizontalLevel: this.getDroppedLevel(),
      };
    }
  };

  calculateEffectivePath = (
    flatItem: FlattenedItem,
    snapshot: DraggableStateSnapshot,
  ): Path => {
    const { flattenedTree, draggedItemId } = this.state;

    if (
      this.dragState &&
      draggedItemId === flatItem.item.id &&
      (this.dragState.destination || this.dragState.combine)
    ) {
      const {
        source,
        destination,
        combine,
        horizontalLevel,
        mode,
      } = this.dragState;
      // We only update the path when it's dragged by keyboard or drop is animated
      if (mode === 'SNAP' || snapshot.isDropAnimating) {
        if (destination) {
          // Between two items
          return getDestinationPath(
            flattenedTree,
            source.index,
            destination.index,
            horizontalLevel,
          );
        }
        if (combine) {
          // Hover on other item while dragging
          return getDestinationPath(
            flattenedTree,
            source.index,
            getIndexById(flattenedTree, combine.draggableId),
            horizontalLevel,
          );
        }
      }
    }
    return flatItem.path;
  };

  isExpandable = (item: FlattenedItem): boolean =>
    !!item.item.hasChildren && !item.item.isExpanded;

  getDroppedLevel = (): number | undefined => {
    const { offsetPerLevel } = this.props;
    const { draggedItemId } = this.state;

    if (!this.dragState || !this.containerElement) {
      return undefined;
    }

    const containerLeft = getBox(this.containerElement).contentBox.left;
    const itemElement = this.itemsElement[draggedItemId!];

    if (itemElement) {
      const currentLeft: number = getBox(itemElement).contentBox.left;
      const relativeLeft: number = Math.max(currentLeft - containerLeft, 0);
      return (
        Math.floor((relativeLeft + offsetPerLevel / 2) / offsetPerLevel) + 1
      );
    }

    return undefined;
  };

  patchDroppableProvided = (provided: DroppableProvided): DroppableProvided => {
    return {
      ...provided,
      innerRef: ((el: HTMLElement) => {
        this.containerElement = el;
        provided.innerRef(el);
      }) as any,
    };
  };

  setItemRef = (itemId: ItemId, el: HTMLElement | null) => {
    if (el) {
      this.itemsElement[itemId] = el;
    }
  };

  renderItems = (): Array<ReactNode> => {
    const { flattenedTree } = this.state;
    return flattenedTree.map(this.renderItem);
  };

  renderItem = (flatItem: FlattenedItem, index: number): ReactNode => {
    const { isDragEnabled } = this.props;

    const isDragDisabled =
      typeof isDragEnabled === 'function'
        ? !isDragEnabled(flatItem.item)
        : !isDragEnabled;

    return (
      <Draggable
        key={flatItem.item.id}
        draggableId={flatItem.item.id.toString()}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {this.renderDraggableItem(flatItem)}
      </Draggable>
    );
  };

  renderDraggableItem = (flatItem: FlattenedItem) => (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
  ) => {
    const { renderItem, onExpand, onCollapse, offsetPerLevel } = this.props;

    const currentPath: Path = this.calculateEffectivePath(flatItem, snapshot);
    if (snapshot.isDropAnimating) {
      this.onDropAnimating();
    }
    return (
      <TreeItem
        key={flatItem.item.id}
        item={flatItem.item}
        path={currentPath}
        onExpand={onExpand}
        onCollapse={onCollapse}
        renderItem={renderItem}
        provided={provided}
        snapshot={snapshot}
        itemRef={this.setItemRef}
        offsetPerLevel={offsetPerLevel}
      />
    );
  };

  render() {
    const { isNestingEnabled } = this.props;
    const renderedItems = this.renderItems();

    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
        onDragUpdate={this.onDragUpdate}
      >
        <Droppable
          droppableId="tree"
          isCombineEnabled={isNestingEnabled}
          ignoreContainerClipping
        >
          {(provided: DroppableProvided) => {
            const finalProvided: DroppableProvided = this.patchDroppableProvided(
              provided,
            );
            return (
              <div
                ref={finalProvided.innerRef}
                style={{ pointerEvents: 'auto' }}
                onTouchMove={this.onPointerMove}
                onMouseMove={this.onPointerMove}
                {...finalProvided.droppableProps}
              >
                {renderedItems}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
    );
  }
}
