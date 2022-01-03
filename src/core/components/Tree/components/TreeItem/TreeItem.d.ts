import { Component } from 'react';
import { DraggableProvidedDraggableProps, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { Props } from './TreeItem-types';
export default class TreeItem extends Component<Props> {
    shouldComponentUpdate(nextProps: Props): boolean;
    patchDraggableProps: (draggableProps: DraggableProvidedDraggableProps, snapshot: DraggableStateSnapshot) => DraggableProvidedDraggableProps;
    render(): import("react").ReactNode;
}
