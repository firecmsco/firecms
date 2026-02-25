import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowForwardIcon, Card, Container, Typography } from "@firecms/ui";

const devLinks = [
    { to: "/dev/data", label: "Data", description: "Execute raw SQL queries against your database." },
    { to: "/dev/users", label: "Users", description: "Manage CMS users and permissions." },
    { to: "/dev/roles", label: "Roles", description: "Configure roles and access control." },
];

export function DeveloperHomePage() {

    const navigate = useNavigate();

    return (
        <div className="py-2 overflow-auto h-full w-full">
            <Container maxWidth="6xl">
                <div className="py-4">
                    <Typography variant="h4" className="mb-2 mt-4 font-bold">
                        Developer Dashboard
                    </Typography>
                    <Typography variant="body2" color="secondary" className="mb-8">
                        System configuration, monitoring, and developer tools.
                    </Typography>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {devLinks.map((link) => (
                            <Card
                                key={link.to}
                                className="px-4 py-3 cursor-pointer min-h-[140px] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
                                onClick={() => navigate(link.to)}
                            >
                                <div className="flex flex-col items-start h-full">
                                    <div className="grow w-full">
                                        <Typography
                                            gutterBottom
                                            variant="subtitle1"
                                            className="font-medium mt-1"
                                            component="h2"
                                        >
                                            {link.label}
                                        </Typography>
                                        <Typography variant="caption" color="secondary">
                                            {link.description}
                                        </Typography>
                                    </div>
                                    <div className="self-end p-2">
                                        <ArrowForwardIcon className="text-primary" size="small" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
}
