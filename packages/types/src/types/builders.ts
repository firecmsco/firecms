import { AuthController, RebaseData } from "../controllers";
import { User } from "../users";
import { EntityCollection } from "./collections";
import { CMSView } from "../controllers/navigation";

export type EntityCollectionsBuilder<EC extends EntityCollection = EntityCollection> = (params: {
    user: User | null,
    authController: AuthController,
    data: RebaseData
}) => EC[] | Promise<EC[]>;

export type CMSViewsBuilder = (params: {
    user: User | null,
    authController: AuthController,
    data: RebaseData
}) => CMSView[] | Promise<CMSView[]>;
