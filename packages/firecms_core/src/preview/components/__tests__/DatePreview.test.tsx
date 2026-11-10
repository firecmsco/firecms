/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react";

import { DatePreview } from "../DatePreview";
import { CustomizationControllerContext } from "../../../contexts/CustomizationControllerContext";
import { CustomizationController } from "../../../types";

// FireCMS locales are date-fns keys. Intl.DateTimeFormat threw on a region key such as
// "enUS", so a date with a timezone took its whole field down for those projects.

function renderWithLocale(locale: string | undefined) {
    return render(
        <CustomizationControllerContext.Provider value={{ locale } as CustomizationController}>
            <DatePreview date={new Date("2026-11-10T09:30:00Z")} mode="date" timezone="Europe/Madrid"/>
        </CustomizationControllerContext.Provider>
    );
}

describe("DatePreview with a timezone", () => {

    it("formats in a region locale's language tag", () => {
        const { container } = renderWithLocale("ptBR");
        expect(container.textContent).toContain("2026");
        expect(container.textContent).toContain("nov");
    });

    it("formats with a plain language key", () => {
        expect(renderWithLocale("es").container.textContent).toContain("2026");
        expect(renderWithLocale(undefined).container.textContent).toContain("Nov 10, 2026");
    });

    it("falls back to en-US for a stored value Intl can't read", () => {
        expect(renderWithLocale("en_US").container.textContent).toContain("Nov 10, 2026");
    });
});
