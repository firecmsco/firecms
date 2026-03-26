import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from "../common/firebase_config";

interface BlogEntryData {
    name: string;
    header_image?: string;
    status: string;
    created_on?: any;
    publish_date?: any;
    reviewed?: boolean;
    tags?: string[];
    content?: ContentBlock[];
}

type ContentBlock =
    | { type: "text"; value: string }
    | { type: "quote"; value: string }
    | { type: "images"; value: string[] }
    | { type: "products"; value: any[] };

interface ResolvedEntry extends BlogEntryData {
    resolvedHeaderImage?: string;
    resolvedContent?: ResolvedContentBlock[];
}

type ResolvedContentBlock =
    | { type: "text"; value: string }
    | { type: "quote"; value: string }
    | { type: "images"; value: string[]; resolvedUrls: string[] }
    | { type: "products"; value: any[] };

function getApp() {
    const existing = getApps().find(a => a.name === "blog");
    if (existing) return existing;
    return initializeApp(firebaseConfig, "blog");
}

function formatDate(d: any): string {
    if (!d) return "";
    const date = d.toDate ? d.toDate() : new Date(d.seconds ? d.seconds * 1000 : d);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

async function resolveUrl(app: any, path?: string): Promise<string | undefined> {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    try {
        const storage = getStorage(app);
        return await getDownloadURL(ref(storage, path));
    } catch {
        return undefined;
    }
}

function renderMarkdown(md: string): string {
    let html = md
        .replace(/```([\s\S]*?)```/g, '<pre style="background:rgb(23,23,26);border-radius:0.75rem;padding:1rem;margin:1rem 0;overflow-x:auto;font-size:0.875rem;font-family:monospace;color:#b7b7bf"><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code style="background:rgb(23,23,26);padding:0.125rem 0.375rem;border-radius:0.25rem;color:#0070f4;font-size:0.875rem">$1</code>')
        .replace(/^### (.+)$/gm, '<h3 style="font-size:1.25rem;font-weight:600;color:#ffffff;margin:2rem 0 0.75rem">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 style="font-size:1.5rem;font-weight:700;color:#ffffff;margin:2.5rem 0 1rem">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="font-size:2rem;font-weight:700;color:#ffffff;margin:2.5rem 0 1rem">$1</h1>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="border-radius:0.75rem;margin:1.5rem 0;max-width:100%" loading="lazy" />')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0070f4" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#ffffff;font-weight:600">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^[-*] (.+)$/gm, '<li style="margin-left:1rem;color:#b7b7bf;margin-bottom:0.25rem">$1</li>')
        .replace(/^(?!<[hlupai]|<code|<pre|<li|<img)(.+)$/gm, '<p style="color:#b7b7bf;line-height:1.75;margin-bottom:1rem">$1</p>');

    html = html.replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul style="list-style:disc;margin:1rem 0 1rem 1rem">$1</ul>');
    return html;
}

function ContentRenderer({ block }: { block: ResolvedContentBlock }) {
    switch (block.type) {
        case "text":
            return <div dangerouslySetInnerHTML={{ __html: renderMarkdown(block.value || "") }} />;
        case "quote":
            return (
                <blockquote style={{
                    borderLeft: "4px solid #0070f4", paddingLeft: "1.5rem", padding: "0.5rem 0 0.5rem 1.5rem",
                    margin: "2rem 0", fontStyle: "italic", color: "#6b7280", fontSize: "1.1rem"
                }}>
                    "{block.value}"
                </blockquote>
            );
        case "images": {
            const urls = (block as any).resolvedUrls || block.value || [];
            return (
                <div style={{
                    margin: "2rem 0", display: "grid", gap: "1rem",
                    gridTemplateColumns: urls.length === 1 ? "1fr" : "1fr 1fr"
                }}>
                    {urls.map((url: string, i: number) => (
                        <img
                            key={i}
                            src={url}
                            alt=""
                            style={{ borderRadius: "0.75rem", width: "100%", objectFit: "cover" }}
                            loading="lazy"
                        />
                    ))}
                </div>
            );
        }
        default:
            return null;
    }
}

export function BlogPost() {
    const [entry, setEntry] = useState<ResolvedEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        // Override body centering
        document.body.style.display = "block";
        document.body.style.alignItems = "unset";
        document.body.style.justifyContent = "unset";

        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const id = pathParts[pathParts.length - 1];
        if (!id) { setNotFound(true); setLoading(false); return; }

        const app = getApp();
        const db = getFirestore(app);
        getDoc(doc(db, "blog", id)).then(async snap => {
            if (snap.exists()) {
                const data = snap.data() as BlogEntryData;
                const resolvedHeaderImage = await resolveUrl(app, data.header_image);
                const resolvedContent: ResolvedContentBlock[] = await Promise.all(
                    (data.content || []).map(async (block) => {
                        if (block.type === "images" && block.value) {
                            const resolvedUrls = await Promise.all(
                                block.value.map((path: string) => resolveUrl(app, path))
                            );
                            return { ...block, resolvedUrls: resolvedUrls.filter(Boolean) as string[] };
                        }
                        return block as ResolvedContentBlock;
                    })
                );
                setEntry({ ...data, resolvedHeaderImage, resolvedContent });
            } else {
                setNotFound(true);
            }
            setLoading(false);
        }).catch(() => { setNotFound(true); setLoading(false); });
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                    width: 32, height: 32, border: "2px solid #0070f4", borderTopColor: "transparent",
                    borderRadius: "50%", animation: "spin 1s linear infinite"
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (notFound || !entry) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", background: "#000000", color: "#ffffff"
            }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>Post not found</h1>
                <p style={{ color: "#6b7280", marginBottom: "2rem" }}>This blog entry doesn't exist or has been removed.</p>
                <a href="/blog" style={{ color: "#0070f4", textDecoration: "none" }}>← Back to blog</a>
            </div>
        );
    }

    const headerImgSrc = entry.resolvedHeaderImage;

    return (
        <div style={{ minHeight: "100vh", background: "#000000", color: "#ffffff" }}>
            {/* Hero image */}
            {headerImgSrc && (
                <div style={{ position: "relative", width: "100%", height: "50vh", minHeight: 300, maxHeight: 500 }}>
                    <img
                        src={headerImgSrc}
                        alt={entry.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top, #000000, rgba(0,0,0,0.4) 50%, transparent)"
                    }} />
                </div>
            )}

            {/* Article */}
            <article style={{
                maxWidth: 720, margin: "0 auto",
                padding: "0 1.5rem 6rem",
                ...(headerImgSrc ? { marginTop: "-8rem", position: "relative" as const, zIndex: 10 } : { paddingTop: "5rem" })
            }}>
                {entry.tags && entry.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                        {entry.tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: "0.7rem", padding: "0.2rem 0.75rem", borderRadius: 99,
                                background: "rgba(0, 112, 244, 0.15)", color: "#0070f4", fontWeight: 500
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <h1 style={{
                    fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 500, lineHeight: 1.15, margin: 0,
                    color: "#ffffff"
                }}>
                    {entry.name}
                </h1>

                <div style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    marginTop: "1.5rem", marginBottom: "3rem", fontSize: "0.875rem", color: "#6b7280"
                }}>
                    <time>{formatDate(entry.publish_date || entry.created_on)}</time>
                    {entry.reviewed && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#0070f4" }}>
                            ✓ Reviewed
                        </span>
                    )}
                </div>

                <div style={{
                    width: 64, height: 4, borderRadius: 99, marginBottom: "3rem",
                    background: "#0070f4"
                }} />

                <div>
                    {(entry.resolvedContent || entry.content || []).map((block, i) => (
                        <ContentRenderer key={i} block={block as ResolvedContentBlock} />
                    ))}
                </div>

                <div style={{
                    marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid #454552",
                    display: "flex", gap: "1rem", justifyContent: "center"
                }}>
                    <a href="/blog" style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1.5rem", borderRadius: "0.5rem",
                        background: "#0070f4",
                        color: "#ffffff", fontWeight: 600, textDecoration: "none",
                        transition: "all 0.2s",
                        boxShadow: "0 0 20px rgba(0, 112, 244, 0.3)"
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 112, 244, 0.5)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 112, 244, 0.3)";
                        }}>
                        ← Back to Blog
                    </a>
                    <a href="/cms" style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.75rem 1.5rem", borderRadius: "0.5rem",
                        border: "1px solid #454552",
                        background: "rgba(23, 23, 26, 0.5)",
                        color: "#b7b7bf", fontWeight: 500,
                        textDecoration: "none", transition: "all 0.2s"
                    }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#0070f4";
                            e.currentTarget.style.color = "#0070f4";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#454552";
                            e.currentTarget.style.color = "#b7b7bf";
                        }}>
                        Edit in CMS →
                    </a>
                </div>
            </article>
        </div>
    );
}
