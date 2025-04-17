import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";

export function BuiltFor() {
    return <Panel color={"transparent"}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-4xl font-bold mb-5">Built for Modern Development Teams</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <div className={"p-6 rounded-xl border " + defaultBorderMixin}>
                    <h3 className="text-lg font-semibold text-blue mb-1 text-primary">Developers</h3>
                    <p className="text-sm text-gray-text-dark leading-relaxed">Rapidly build internal tools, CRUD
                        interfaces, and back-offices without the frontend hassle. Focus on your core application
                        logic.</p>
                </div>
                <div className={"p-6 rounded-xl border " + defaultBorderMixin}>
                    <h3 className="text-lg font-semibold text-blue mb-1 text-primary">Startups</h3>
                    <p className="text-sm text-gray-text-dark leading-relaxed">Get your MVP&#39;s admin panel or basic CMS
                        running in hours, not weeks. Iterate quickly and manage your data efficiently.</p>
                </div>
                <div className={"p-6 rounded-xl border " + defaultBorderMixin}>
                    <h3 className="text-lg font-semibold text-blue mb-1 text-primary">Agencies</h3>
                    <p className="text-sm text-gray-text-dark leading-relaxed">Deliver custom back-office solutions for
                        clients faster and more reliably on top of the scalable Google Cloud infrastructure.</p>
                </div>
                <div className={"p-6 rounded-xl border " + defaultBorderMixin}>
                    <h3 className="text-lg font-semibold text-blue mb-1 text-primary">Content Managers</h3>
                    <p className="text-sm text-gray-text-dark leading-relaxed">
                        Best-in-class user experience for managing your data. FireCMS is designed to be intuitive and
                        easy to use.
                    </p>
                </div>
            </div>
        </div>
    </Panel>;
}
