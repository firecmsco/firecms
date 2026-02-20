import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from "../common/firebase_config";

interface BlogEntryData {
    name: string;
    header_image?: string;
    status: string;
    created_on?: any;
    publish_date?: any;
    tags?: string[];
    content?: any[];
}

interface BlogEntryWithUrl {
    id: string;
    data: BlogEntryData;
    imageUrl?: string;
}

function getApp() {
    const existing = getApps().find(a => a.name === "blog");
    if (existing) return existing;
    return initializeApp(firebaseConfig, "blog");
}

function getExcerpt(content?: any[]): string {
    if (!content) return "";
    for (const block of content) {
        if (block.type === "text" && block.value) {
            const text = block.value.replace(/[#*_\[\]()>`]/g, "").trim();
            if (text.length > 160) return text.slice(0, 160) + "…";
            return text;
        }
    }
    return "";
}

function formatDate(d: any): string {
    if (!d) return "";
    const date = d.toDate ? d.toDate() : new Date(d.seconds ? d.seconds * 1000 : d);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

async function resolveImageUrl(app: any, path?: string): Promise<string | undefined> {
    if (!path) return undefined;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    try {
        const storage = getStorage(app);
        return await getDownloadURL(ref(storage, path));
    } catch {
        return undefined;
    }
}

export function BlogList() {
    const [entries, setEntries] = useState<BlogEntryWithUrl[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Override body styles that center content
        document.body.style.display = "block";
        document.body.style.alignItems = "unset";
        document.body.style.justifyContent = "unset";

        const app = getApp();
        const db = getFirestore(app);
        const q = query(collection(db, "blog"), limit(20));
        getDocs(q).then(async snap => {
            const items = snap.docs.map(doc => ({ id: doc.id, data: doc.data() as BlogEntryData }));
            const withUrls: BlogEntryWithUrl[] = await Promise.all(
                items.map(async (item) => ({
                    ...item,
                    imageUrl: await resolveImageUrl(app, item.data.header_image)
                }))
            );
            setEntries(withUrls);
            setLoading(false);
        }).catch((err) => {
            console.error("Error fetching blog entries:", err);
            setLoading(false);
        });
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

    return (
        <div style={{ minHeight: "100vh", background: "#000000", color: "#b7b7bf" }}>
            {/* Hero */}
            <header style={{ position: "relative", overflow: "hidden", padding: "5rem 1.5rem 3rem", textAlign: "center" }}>
                <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(ellipse at top, rgba(0, 112, 244, 0.15) 0%, transparent 60%)"
                }} />
                <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
                    <p style={{
                        color: "#0070f4", fontWeight: 500, letterSpacing: "0.15em",
                        textTransform: "uppercase", fontSize: "0.8rem", marginBottom: "1rem"
                    }}>FireCMS Blog</p>
                    <h1 style={{
                        fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 500, lineHeight: 1.1,
                        color: "#ffffff", margin: 0
                    }}>
                        Stories & Updates
                    </h1>
                    <p style={{ marginTop: "1rem", color: "#6b7280", fontSize: "1.1rem", maxWidth: 500, margin: "1rem auto 0" }}>
                        Explore articles from the FireCMS demo Firestore database, rendered with Astro.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
                        <a href="/" style={{
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
                            ← Home
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
                            Open CMS →
                        </a>
                    </div>
                </div>
            </header>

            {/* Grid */}
            <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 6rem" }}>
                {entries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "5rem 0", color: "#6b7280" }}>
                        <p style={{ fontSize: "1.25rem" }}>No blog entries found.</p>
                        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                            Create some entries in the <a href="/cms" style={{ color: "#0070f4" }}>CMS</a> first.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid", gap: "2rem",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))"
                    }}>
                        {entries.map(({ id, data, imageUrl }) => (
                            <a
                                key={id}
                                href={`/blog/${id}`}
                                style={{
                                    display: "flex", flexDirection: "column", borderRadius: "0.75rem",
                                    overflow: "hidden", background: "rgb(23, 23, 26)", border: "1px solid #454552",
                                    textDecoration: "none", color: "inherit",
                                    transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s"
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px rgba(0, 112, 244, 0.2)";
                                    (e.currentTarget as HTMLElement).style.borderColor = "#0070f4";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                    (e.currentTarget as HTMLElement).style.borderColor = "#454552";
                                }}
                            >
                                {/* Image */}
                                <div style={{
                                    position: "relative", aspectRatio: "16/10", background: "rgb(23, 23, 26)", overflow: "hidden"
                                }}>
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={data.name}
                                            style={{
                                                width: "100%", height: "100%", objectFit: "cover",
                                                transition: "transform 0.5s"
                                            }}
                                            loading="lazy"
                                            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                                            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                                        />
                                    ) : (
                                        <div style={{
                                            width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                            background: "radial-gradient(ellipse at center, rgba(0, 112, 244, 0.1), transparent)"
                                        }}>
                                            <svg style={{ width: 48, height: 48, color: "#454552" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        background: "linear-gradient(to top, rgba(23,23,26,0.7), transparent 60%)"
                                    }} />
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, padding: "1.25rem", display: "flex", flexDirection: "column" }}>
                                    {data.tags && data.tags.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                            {data.tags.slice(0, 3).map(tag => (
                                                <span key={tag} style={{
                                                    fontSize: "0.7rem", padding: "0.15rem 0.6rem", borderRadius: 99,
                                                    background: "rgba(0, 112, 244, 0.15)", color: "#0070f4", fontWeight: 500
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#ffffff", margin: 0, lineHeight: 1.4 }}>
                                        {data.name}
                                    </h2>

                                    <p style={{
                                        marginTop: "0.5rem", fontSize: "0.85rem", color: "#6b7280",
                                        lineHeight: 1.6, flex: 1,
                                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as any, overflow: "hidden"
                                    }}>
                                        {getExcerpt(data.content)}
                                    </p>

                                    <div style={{
                                        marginTop: "1rem", display: "flex", alignItems: "center",
                                        justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280"
                                    }}>
                                        <time>{formatDate(data.publish_date || data.created_on)}</time>
                                        <span style={{ color: "#0070f4", fontWeight: 500 }}>
                                            Read more →
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid #454552", padding: "2rem 0" }}>
                <div style={{
                    maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem",
                    textAlign: "center", fontSize: "0.875rem", color: "#6b7280"
                }}>
                    <p style={{ margin: 0 }}>Built with FireCMS + Astro</p>
                </div>
            </footer>
        </div>
    );
}
