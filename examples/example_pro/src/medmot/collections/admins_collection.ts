import { buildCollection, EnumValues } from "@firecms/core";

const permissions: EnumValues = {
    admin: "Admin",
    exercises_write: "Exercises write",
    exercises_read: "Exercises read",
    medico_write: "medico write",
    medico_read: "medico read",
    media_write: "media write",
    media_read: "media read",
    insurances_write: "Insurances write",
    insurances_read: "Insurances read",
    diagnosis_write: "Diagnosis write",
    diagnosis_read: "Diagnosis read",
    work_types_write: "Work types write",
    work_types_read: "Work types read",
    sports_write: "Sports write",
    sports_read: "Sports read",
    content_write: "Content write",
    content_read: "Content read",
    surveys_write: "Survey write",
    surveys_read: "Survey read",
    software_releases_write: "Software Releases write",
    software_releases_read: "Software Releases read",
    breathing_exercises_write: "Breathing Exercises write",
    breathing_exercises_read: "Breathing Exercises read",
    marketing_write: "Marketing write",
    marketing_read: "Marketing read"
};

export type AdminUser ={
    name: string,
    permissions: string[],
}

export const adminsCollection = buildCollection<AdminUser>({
    id: "admins",
    name: "Users",
    singularName: "User",
    path: "admins",
    group: "Admin",
    customId: true,
    properties: {
        name: {
            dataType: "string",
            name: "Name"
        },
        permissions: {
            dataType: "array",
            name: "Permissions",
            of: {
                dataType: "string",
                enumValues: permissions
            }
        }
    }
})


