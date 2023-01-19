import React from "react";
import { ContainerMixin } from "../utils";

export function EnterpriseFeatures() {
    return (
        <div className={ContainerMixin}>
            <h2>Why FireCMS?</h2>

            <p>
                FireCMS was developed in conjunction with different companies. We
                built it out of the need to have a CMS that could be used in
                different scenarios and that could be easily customized to fit
                different needs.
            </p>

            <p>
                We have a long experience with the Firebase platform and we have
                published multiple successful apps, both in the B2B and B2C space.
            </p>

            <p>
                Firestore provides a degree of scalability that is hard to find
                in other platforms. It is a great fit for companies that are
                looking to build a product that can scale to millions of users.
                Without the need to worry about the infrastructure.
            </p>


        </div>
    );
}
