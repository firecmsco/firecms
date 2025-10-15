import { useEffect } from "react";

const fireCMSLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAa9SURBVHgB7Z1NbBNHFMf/a7uBEgMOHy2pSlnUql+oEG7lgNgcqZAgR9RKSU5tT9mcqp6SXNoj5tBzHAmk3ggSUo/Ziko9skXqoVIlJm3Von4IhzhAIIk7b9ab+COJvZ63610nP8netWx5Z//73syb2Zm3BjqJXc4BixaQMgHjDFCWW5iVb83aH5eL8jdC7lS2a/Ny3wGyLvJGER3CQJRsCHZBfrqCBpHaRkCJuXYb2O9EKWg0AtpKtDF5gnJr5BA+BSVm/sAsQiY8AZW1PSHR7IhE2wwhX1NAWlrlywIhwC9gPISrR8iyFJDvnQIzvALapRH5PgG+uo0bAbLIfLYAJngEtJ+awOq03LOQCAxZN6bGOdw6BV3GyV1X7iEx4hFlGQGs3qt4jBbtW6Cq65bIXW0km7x06XG0SXsCei57S+4NoDtwZUs91I5LBxfQE28O8W0o2kVIEQeDihhMwO4Vz0cEFbF1AbtfPB8RRMTWBNw54vmIVkVsMYxRDYaJnYOpztl+1LQn1VxAu3QN3dPaBkGe80sTzX60vQt7geY0IsDcMw8r+wPO9N6H2TOPXHpBbn9DcfWgehHu09OYf/YGnNJ5uE9OIyJkjyWb3+rLrQVU9R71MMIbELD238XlvjsYOXQTuUywIbziSg6zC5cw8+/HcBbPI0RkwdJnt6oPtxFw6ZbX5eFn5PANDB+5qQTkQCyfwNSfX6Lw3ycICTkclh3c7IvNBQzJdUmwide+YhOunpCFHN1sFGcrAR+AsdUl95zo/xr2q98gCkhAEpIEZUQAL6Qr99XUNY2tsL3EOp5HjcPc2x9FJh5BVQQdk47NiAlkGgZOai2QOWD2xWM+kZah1nvwl+84W2xpfS9OVlthnQWuWugS8QgKhebeuYiBfffBRK7eCutduGng2ApxEM+HX0RjrPrThoD2Y7b7tHERz4dEvPXmVbXl+DvvNq1HlQWmLoMBClPiJJ4PlWn65KfgIbVuhV4jojrNLz2CJlTIBx+cQpwZ+vVbzBYvQZP1xqRigWkLDEybnyHuXDv+BYcrS4PrsWinIqC++17J3Qmth8EJeQlPTErTVDbqQAuajEUYKOsyfPgm9DGU0Rkc9V8S6r56KMDWH8V50SctMKM9WErumzSGj9yAPj0WubAFTXhcIlp4LnrZTFVmhbYNtWiMXaXI4Cm3cUYKmNIa80mieD76UYOyQGgN2SdZQLrnovsXJKAJDRgK0TE4upzaFpjLsHTQO8JB/R6JmYEuyz3A4gEkkuW90EVfwLvyZtXffUgkB03gfWihP0N1h0MCCmhQTOu7QadY0C97UdsCxd64rGQIjtijXXahbYHuvn4kFbf3GDQhC1zTCobcfdqF6Bhur+7FN8gCUy40KGb2wjlgImmQ++pf/LV5skABTb6ncCBhMF10Rwq46kCT/LFzSBozr5yFPituqjJNQUCDpLkxuS9DeUXVXbnybWgydXwQSWHquAUGHHrzBXSgCV3RJFghWV/hKIf7GsroKgKqelB7mfzoW0OIO0zWJ3nu0LsnoKoH9a2Qru64eRFxpXB0gMn6UPCnuFV35a6DgXz/h7F0Zd6La6y3GXUTLEt0f1i7g2guFzH387TaxgESb/DUKEffV/0d8tmT/oe6wYQyixUyF1gLCrGG3r3KWZaavAt1Aq7QghIWs4mDiCQelYGxvy5UBpAqagX0GhMWK1RHq4jIMOrR1rHPnv6cebCjPFO/4KZxmYM3V4ZyIJhgZPIPBxO/zyEKrvefw+TrlrJARmrqPp9IF9qE3biQ1VEsGlIUEGChDWGXyFwshMDIPy7G/voRA0sPwQFVEddl+MQU422CMYt876a9hCaLDVfJlUNrBQaePIQthbywIAJbJbnnjAyMZw+9F3LcSVnjMm0sNiTsEq2JuIYIIDHNZ0VYjx/gxPMicivPar4nweZ7cmoUmSwuwpHw0e0yHTVf8m8v5uvXRuwcZESS379tXpwW7sqtTELlVdlxuM3EI5oLqGLDNFWgAjsHUTnnpuymPWlE8Kc98dlNvNNAMAGJ3dRPNQSf2qEOkKYbIN3UsLjtiEcEt8BquiLEocGT7GS7mX/1BCS8fjMF2wmbZaTyUk9tlxOmFfQFJLwcM1JE4wqSgSNddpQjBSiPgD67SWiZsBcn5V8PIzZCkrvSTTPprsxZzsMRkPDCHQsdtcjwhPMJT8BqvHwM8pUaRuiQaCkHWKOBAAchE42APusPI1Bi0gMJTPAgvPk9NDmgGx9GsBVK0NIA1Mg3rdlTCx9z3rYha5zY2NLjMMo/eXMboxWsnv8Br15XnnLWoGsAAAAASUVORK5CYII=";

/**
 * Internal hook to handle the browser title and icon
 * @param name
 * @param logo
 */
export function useBrowserTitleAndIcon(name: string, logo?: string) {
    useEffect(() => {
        if (document) {
            document.title = `${name} - FireCMS`;
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement("link");
                // @ts-ignore
                link.rel = "icon";
                document.getElementsByTagName("head")[0].appendChild(link);
            }
            // @ts-ignore
            link.href = logo ?? fireCMSLogo;
        }
    }, [name, logo]);
}
