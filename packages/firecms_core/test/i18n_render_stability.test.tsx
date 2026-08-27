/**
 * @jest-environment jsdom
 */
/**
 * The provider must not repaint forever when its `translations` prop is a fresh
 * object on every render.
 *
 * `FireCMSCloudApp` mounts a nested provider as
 * `<FireCMSi18nProvider translations={appConfig?.translations}>`, and callers
 * build that object inline — the SaaS does exactly this, merging its own strings
 * into `appConfig.translations` in the render body. So the prop's identity
 * changes on every render even though its contents never do.
 *
 * That was harmless while nothing listened to the resource store. Binding store
 * events so lazily loaded locales repaint turns it into a cycle: the effect
 * writes a bundle, the write raises `added`, react-i18next repaints, the render
 * produces a new object, and the effect writes again.
 */
import { describe, expect, it } from "@jest/globals";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { FireCMSi18nProvider } from "../src/i18n/FireCMSi18nProvider";
import { useTranslation } from "../src/hooks/useTranslation";

let renders = 0;

function CountingProbe() {
    const { t } = useTranslation();
    renders++;
    return <span data-testid="out">{t("create")}</span>;
}

/** Rebuilds the translations object on every render, as the callers do. */
function UnstableHost() {
    const [, force] = React.useReducer((n: number) => n + 1, 0);
    return (
        <FireCMSi18nProvider translations={{ en: { create: "Publish" } }}>
            <CountingProbe/>
            <button data-testid="rerender" onClick={() => force()}>rerender</button>
        </FireCMSi18nProvider>
    );
}

/**
 * The shape that actually exists in the SaaS: an outer provider, a component
 * under it that subscribes with `useTranslation` and rebuilds the nested
 * provider's `translations` in its render body, and the nested provider itself.
 *
 * Here a store write really can feed back — the write repaints the subscribed
 * ancestor, which hands the nested provider a fresh object, whose effect writes
 * again.
 */
function SubscribedRebuildingHost() {
    const { t } = useTranslation();
    // Reading a key subscribes this component to store events.
    const label = t("create");
    return (
        <FireCMSi18nProvider translations={{ en: { create: label + "" } }}>
            <CountingProbe/>
        </FireCMSi18nProvider>
    );
}

describe("provider render stability", () => {

    it("settles instead of repainting forever on an unstable translations prop", async () => {
        renders = 0;
        render(<UnstableHost/>);
        await waitFor(() => expect(screen.getByTestId("out").textContent).toEqual("Publish"));

        // Let any pending store events drain.
        await new Promise((resolve) => setTimeout(resolve, 250));
        const settled = renders;
        await new Promise((resolve) => setTimeout(resolve, 250));

        expect({ grewWhileIdle: renders > settled, renders }).toEqual({ grewWhileIdle: false, renders: settled });
        // A handful of renders is expected; hundreds means it is cycling.
        expect(renders).toBeLessThan(15);
    });

    it("settles when a subscribed ancestor rebuilds the prop on every repaint", async () => {
        renders = 0;
        render(
            <FireCMSi18nProvider>
                <SubscribedRebuildingHost/>
            </FireCMSi18nProvider>
        );
        await waitFor(() => expect(screen.getAllByTestId("out").length).toBeGreaterThan(0));

        await new Promise((resolve) => setTimeout(resolve, 300));
        const settled = renders;
        await new Promise((resolve) => setTimeout(resolve, 300));

        expect({ grewWhileIdle: renders > settled }).toEqual({ grewWhileIdle: false });
        expect(renders).toBeLessThan(30);
    });
});
