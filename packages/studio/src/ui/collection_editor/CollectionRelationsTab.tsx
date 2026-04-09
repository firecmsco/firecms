import React, { useState } from "react";
import {
    Button, IconButton, Typography, Table, TableHeader, TableCell, TableBody, TableRow,
    TextField, Select, SelectItem, Container, DeleteIcon, Dialog, DialogTitle, DialogContent, DialogActions
} from "@rebasepro/ui";
import { useFormex } from "@rebasepro/formex";
import { EntityCollection, Relation } from "@rebasepro/types";
import { useCollectionsConfigController } from "../../useCollectionsConfigController";

export function CollectionRelationsTab() {
    const { values, setFieldValue } = useFormex<EntityCollection>();
    const { collections } = useCollectionsConfigController();
    const [editingRelationIndex, setEditingRelationIndex] = useState<number | null>(null);
    const [editingRelationState, setEditingRelationState] = useState<Partial<Relation> | null>(null);

    const getTargetSlug = (target: any) => {
        if (typeof target === 'string') {
            const match = target.match(/\(\)\s*=>\s*([a-zA-Z0-9_]+)/);
            return match ? match[1] : target;
        }
        if (typeof target === 'function') {
            try {
                // If we attached a slug manually
                if (target.slug) return target.slug;
                const col = target();
                return col?.slug || col?.dbPath || col?.name || "";
            } catch (e) {
                return "";
            }
        }
        return "";
    };

    const relations = values.relations || [];

    const handleDelete = (index: number) => {
        const newRelations = [...relations];
        newRelations.splice(index, 1);
        setFieldValue("relations", newRelations);
    };

    const handleSave = () => {
        if (!editingRelationState) return;
        
        const newRelations = [...relations];
        if (editingRelationIndex === -1) {
            newRelations.push(editingRelationState as Relation);
        } else if (editingRelationIndex !== null) {
            newRelations[editingRelationIndex] = editingRelationState as Relation;
        }
        setFieldValue("relations", newRelations);
        
        setEditingRelationIndex(null);
        setEditingRelationState(null);
    };

    const handleCancel = () => {
        setEditingRelationIndex(null);
        setEditingRelationState(null);
    };

    return (
        <div className="overflow-auto my-auto h-full w-full">
            <Container maxWidth="4xl" className="flex flex-col gap-4 p-8 m-auto h-full">
                <div className="flex items-center justify-between mb-8">
                    <Typography variant="h5">Relations</Typography>
                    <Button variant="filled" color="neutral" onClick={() => {
                        setEditingRelationIndex(-1);
                        setEditingRelationState({ relationName: "", target: "" as unknown as Relation['target'], cardinality: "many", direction: "owning" });
                    }}>
                        ADD RELATION
                    </Button>
                </div>
                
                {relations.length > 0 ? (
                    <div className="w-full overflow-auto border dark:border-surface-800 rounded-lg">
                        <Table className="w-full">
                            <TableHeader>
                                <TableCell header className="w-16"></TableCell>
                                <TableCell header>Name</TableCell>
                                <TableCell header>Target</TableCell>
                                <TableCell header>Cardinality</TableCell>
                                <TableCell header>Direction</TableCell>
                            </TableHeader>
                            <TableBody>
                                {relations.map((relation, index) => (
                                    <TableRow key={index} 
                                              className="cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"
                                              onClick={() => {
                                                  setEditingRelationIndex(index);
                                                  setEditingRelationState(relation);
                                              }}>
                                        <TableCell style={{ width: "64px" }}>
                                            <IconButton size="small" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(index);
                                            }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell className="font-medium">{relation.relationName}</TableCell>
                                        <TableCell>{getTargetSlug(relation.target) || 'Function'}</TableCell>
                                        <TableCell>{relation.cardinality}</TableCell>
                                        <TableCell>{relation.direction || "owning"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col border border-dashed dark:border-surface-700 rounded-lg items-center justify-center text-text-disabled py-20">
                        <Typography variant="body2" className="mb-4">No relations defined for this collection.</Typography>
                        <Button variant="text" onClick={() => {
                            setEditingRelationIndex(-1);
                            setEditingRelationState({ relationName: "", target: "" as unknown as Relation['target'], cardinality: "many", direction: "owning" });
                        }}>Create your first relation</Button>
                    </div>
                )}
                
                <Dialog open={!!editingRelationState} onOpenChange={(open) => !open && handleCancel()} maxWidth="2xl">
                    {editingRelationState && (
                        <>
                            <DialogTitle className="flex justify-between items-center w-full" variant="h6">
                                {editingRelationIndex === -1 ? "New Relation" : "Edit Relation"}
                            </DialogTitle>
                            <DialogContent includeMargin={false} className="p-4 md:p-6 border-t dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
                                <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                                    <TextField 
                                        label="Relation Name" 
                                        name="relationName" 
                                        placeholder="e.g. posts"
                                        value={editingRelationState.relationName || ""}
                                        onChange={(e) => setEditingRelationState(prev => prev ? { ...prev, relationName: e.target.value } : null)} 
                                    />
                                    <Select 
                                        fullWidth
                                        label="Target Collection" 
                                        value={getTargetSlug(editingRelationState.target)} 
                                        onValueChange={(val) => {
                                            setEditingRelationState(prev => {
                                                if (!prev) return null;
                                                const targetFn = () => collections?.find(c => c.slug === val) || { slug: val };
                                                (targetFn as { slug?: string }).slug = val;
                                                return { ...prev, target: targetFn as unknown as Relation['target'] };
                                            });
                                        }}
                                    >
                                        {collections?.map(col => (
                                            <SelectItem key={col.slug || col.dbPath} value={col.slug}>{col.name || col.slug}</SelectItem>
                                        ))}
                                    </Select>
                                    <Select 
                                        fullWidth
                                        label="Cardinality" 
                                        value={editingRelationState.cardinality || "many"} 
                                        onValueChange={(val) => setEditingRelationState(prev => prev ? { ...prev, cardinality: val as Relation['cardinality'] } : null)}
                                    >
                                        <SelectItem value="many">Many</SelectItem>
                                        <SelectItem value="one">One</SelectItem>
                                    </Select>
                                    <Select 
                                        fullWidth
                                        label="Direction" 
                                        value={editingRelationState.direction || "owning"} 
                                        onValueChange={(val) => setEditingRelationState(prev => prev ? { ...prev, direction: val as Relation['direction'] } : null)}
                                    >
                                        <SelectItem value="owning">Owning</SelectItem>
                                        <SelectItem value="inverse">Inverse</SelectItem>
                                    </Select>
                                    
                                    {editingRelationState.cardinality === "many" && editingRelationState.direction === "owning" && (
                                        <div className="flex flex-col gap-4 mt-4 pt-4 border-t dark:border-surface-800">
                                            <Typography variant="subtitle2" className="text-text-primary">Intermediate Table</Typography>
                                            <Typography variant="body2" className="text-text-secondary -mt-3">
                                                Required for many-to-many relationships. This defines the junction table linking both collections.
                                            </Typography>
                                            
                                            <TextField 
                                                label="Table Name" 
                                                name="throughTable" 
                                                placeholder="e.g. user_roles"
                                                value={editingRelationState.through?.table || ""}
                                                onChange={(e) => setEditingRelationState(prev => prev ? { ...prev, through: { ...(prev.through || { sourceColumn: "", targetColumn: "" }), table: e.target.value } } : null)} 
                                            />
                                            <div className="flex gap-4">
                                                <TextField 
                                                    className="flex-1"
                                                    label="Source Column" 
                                                    name="sourceColumn" 
                                                    placeholder="FK to this collection"
                                                    value={editingRelationState.through?.sourceColumn || ""}
                                                    onChange={(e) => setEditingRelationState(prev => prev ? { ...prev, through: { ...(prev.through || { table: "", targetColumn: "" }), sourceColumn: e.target.value } } : null)} 
                                                />
                                                <TextField 
                                                    className="flex-1"
                                                    label="Target Column" 
                                                    name="targetColumn" 
                                                    placeholder="FK to target collection"
                                                    value={editingRelationState.through?.targetColumn || ""}
                                                    onChange={(e) => setEditingRelationState(prev => prev ? { ...prev, through: { ...(prev.through || { table: "", sourceColumn: "" }), targetColumn: e.target.value } } : null)} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button variant="text" onClick={handleCancel}>Cancel</Button>
                                <Button 
                                    variant="filled" 
                                    color="primary" 
                                    onClick={handleSave}
                                    disabled={!editingRelationState.relationName || !editingRelationState.target}
                                >
                                    Save
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </Container>
        </div>
    );
}
