/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { FireCMSi18nProvider } from "../FireCMSi18nProvider";

function Str({ k }: { k: string }) {
    const { t } = useTranslation("firecms_core");
    return <span data-testid={k}>{t(k)}</span>;
}

const host = { en: { host_key: "Host" } } as any;
const projectA = { en: { only_in_a: "From project A" } } as any;
const projectB = { en: { only_in_b: "From project B" } } as any;

describe("nested provider lifecycle", () => {
    beforeEach(() => window.localStorage.clear());

    it("does not carry one project's translations into the next", () => {
        // The real shape of a project switch: App.tsx's provider stays mounted while
        // FireCMSCloudApp's inner one is torn down and rebuilt with another project's
        // translations. Both share the outer i18next instance now, so anything the
        // first project added could outlive it.
        const { rerender } = render(
            <FireCMSi18nProvider translations={host}>
                <FireCMSi18nProvider key={"a"} translations={projectA}>
                    <Str k={"only_in_a"}/>
                </FireCMSi18nProvider>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("only_in_a").textContent).toBe("From project A");

        rerender(
            <FireCMSi18nProvider translations={host}>
                <FireCMSi18nProvider key={"b"} translations={projectB}>
                    <>
                        <Str k={"only_in_b"}/>
                        <Str k={"only_in_a"}/>
                    </>
                </FireCMSi18nProvider>
            </FireCMSi18nProvider>
        );

        expect(screen.getByTestId("only_in_b").textContent).toBe("From project B");
        expect(screen.getByTestId("only_in_a").textContent).toBe("only_in_a");
    });

    it("keeps the host's own translations across the switch", () => {
        const { rerender } = render(
            <FireCMSi18nProvider translations={host}>
                <FireCMSi18nProvider key={"a"} translations={projectA}>
                    <Str k={"host_key"}/>
                </FireCMSi18nProvider>
            </FireCMSi18nProvider>
        );
        rerender(
            <FireCMSi18nProvider translations={host}>
                <FireCMSi18nProvider key={"b"} translations={projectB}>
                    <Str k={"host_key"}/>
                </FireCMSi18nProvider>
            </FireCMSi18nProvider>
        );
        expect(screen.getByTestId("host_key").textContent).toBe("Host");
    });
});
