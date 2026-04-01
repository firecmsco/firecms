import { useContext } from "react";
import { RebaseData } from "@rebasepro/types";
import { RebaseDataContext } from "../../contexts/RebaseDataContext";

/**
 * Use this hook to access the unified data API.
 *
 * ```ts
 * const data = useData();
 * const { data: products } = await data.products.find({ where: { status: "eq.published" } });
 * await data.products.create({ name: "Camera", price: 299 });
 * ```
 *
 * @group Hooks and utilities
 */
export const useData = (): RebaseData => {
    return useContext(RebaseDataContext);
};
