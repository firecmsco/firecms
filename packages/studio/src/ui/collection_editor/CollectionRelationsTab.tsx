import React, { useState } from "react";
import {
    Button, IconButton, Typography, Table, TableHeader, TableCell, TableBody, TableRow,
    TextField, Select, SelectItem, Container, DeleteIcon
} from "@rebasepro/ui";
import { useFormex } from "@rebasepro/formex";
import { PersistedCollection } from "../../types/persisted_collection";
import { Relation } from "@rebasepro/types";

export function CollectionRelationsTab() {
    const { values, setFieldValue } = useFormex<PersistedCollection>();
    const [editingRelation, setEditingRelation] = useState<Relation | "new" | null>(null);

    const relations = values.relations || [];

    const handleDelete = (index: number) => {
        const newRelations = [...relations];
        newRelations.splice(index, 1);
        setFieldValue("relations", newRelations);
    };

    if (editingRelation) {
        return (
            <div className="h-full w-full bg-surface-50 dark:bg-surface-900 border-l border-r border-b dark:border-surface-800 rounded-b-lg p-0 flex flex-col">
                <div className="flex-grow p-6 overflow-auto">
                    <Typography variant="h5" className="mb-6">
                        {editingRelation === "new" ? "New Relation" : "Edit Relation"}
                    </Typography>
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <TextField 
                            label="Relation Name" 
                            name="relationName" 
                            placeholder="e.g. posts"
                            value={editingRelation !== "new" ? editingRelation.relationName : ""}
                            onChange={() => {}} 
                            disabled 
                        />
                        <TextField 
                            label="Target Collection" 
                            name="target" 
                            value={""}
                            onChange={() => {}} 
                            disabled 
                        />
                        <Select label="Cardinality" value={editingRelation !== "new" ? editingRelation.cardinality || "many" : "many"} onValueChange={() => {}} disabled>
                            <SelectItem value="many">Many</SelectItem>
                            <SelectItem value="one">One</SelectItem>
                        </Select>
                        <Select label="Direction" value={editingRelation !== "new" ? editingRelation.direction || "owning" : "owning"} onValueChange={() => {}} disabled>
                            <SelectItem value="owning">Owning</SelectItem>
                            <SelectItem value="inverse">Inverse</SelectItem>
                        </Select>
                        <Typography variant="label" color="secondary" className="mt-4">
                            Full relation editing is coming soon.
                        </Typography>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-4 border-t dark:border-surface-800 bg-surface-100 dark:bg-surface-800">
                    <Button variant="text" onClick={() => setEditingRelation(null)}>Cancel</Button>
                    <Button variant="filled" color="primary" disabled>Save</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-auto my-auto h-full w-full">
            <Container maxWidth="4xl" className="flex flex-col gap-4 p-8 m-auto h-full">
                <div className="flex items-center justify-between mb-8">
                    <Typography variant="h5">Relations</Typography>
                    <Button variant="filled" color="neutral" onClick={() => setEditingRelation("new")}>
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
                                              onClick={() => setEditingRelation(relation)}>
                                        <TableCell style={{ width: "64px" }}>
                                            <IconButton size="small" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(index);
                                            }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell className="font-medium">{relation.relationName}</TableCell>
                                        <TableCell>{typeof relation.target === 'string' ? relation.target : 'Function'}</TableCell>
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
                        <Button variant="text" onClick={() => setEditingRelation("new")}>Create your first relation</Button>
                    </div>
                )}
            </Container>
        </div>
    );
}
