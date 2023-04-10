import React, { useEffect, useRef } from "react";
import Layout from "@theme/Layout";
import "aos/dist/aos.css";
import "../../css/tailwind.css";
import Head from "@docusaurus/Head";

function PrivacyPolicy() {
    const divRef = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        if (divRef.current) {
            divRef.current.innerHTML = policyHtml;
        }
    }, [divRef]);

    return (
        <Layout
            title={"Privacy policy - FireCMS"}
            description="Awesome headless CMS based Firestore/Firebase and React, and completely open-source">
            <Head>
                <title>Privacy policy - FireCMS</title>
            </Head>
            <main className="flex-grow container mx-auto px-4 py-8"
                  ref={divRef}>

            </main>

        </Layout>
    );
}

export default PrivacyPolicy;

const policyHtml = `
      <div>
    <div><strong><span
            style="font-size: 26px;"><span>PRIVACY NOTICE</span></span></strong>
    </div>
    <div><br></div>
    <div><span><strong><span>Last updated April 10, 2023</span></strong></span>
    </div>
    <div><br></div>
    <div><br></div>
    <div><br></div>
    <div><span>This privacy notice for FireCMS, S.L. ("<strong>Company</strong>," "<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"</span><span>), describes how and why we might collect, store, use, and/or share ("<strong>process</strong>") your information when you use our services ("<strong>Services</strong>"), such as when you:</span>
    </div>
    <ul>
        <li><span>Visit our website at <a href="https://firecms.co"
                                          target="_blank">https://firecms.co</a><span>, or any website of ours that links to this privacy notice</span></span>
        </li>
    </ul>
    <div>

        <ul>
            <li><span>Engage with us in other related ways, including any sales, marketing, or events</span>
            </li>
        </ul>
        <div><span><strong>Questions or concerns?&nbsp;</strong>Reading this privacy notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at hello@firecms.co.</span>
        </div>
        <div><br></div>
        <div><br></div>
        <div><strong><span>SUMMARY OF KEY POINTS</span></strong></div>
        <div><br></div>
        <div><span><strong><em>This summary provides key points from our privacy notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for. You can also click&nbsp;</em></strong></span><a><span><strong><em>here</em></strong></span></a><span><strong><em>&nbsp;to go directly to our table of contents.</em></strong></span>
        </div>
        <div><br></div>
        <div><span><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with FireCMS and the Services, the choices you make, and the products and features you use. Click&nbsp;</span><a><span>here</span></a><span>&nbsp;to learn more.</span>
        </div>
        <div><br></div>
        <div>
            <span><strong>Do we process any sensitive personal information?</strong> We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law. Click&nbsp;</span><a><span>here</span></a><span>&nbsp;to learn more.</span>
        </div>
        <div><br></div>
        <div>
            <span><strong>Do we receive any information from third parties?</strong> We do not receive any information from third parties.</span>
        </div>
        <div><br></div>
        <div><span><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Click&nbsp;</span><a><span>here</span></a><span>&nbsp;to learn more.</span>
        </div>
        <div><br></div>
        <div><span><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Click&nbsp;</span><a><span>here</span></a><span>&nbsp;to learn more.</span>
        </div>
        <div><br></div>
        <div><span><strong>How do we keep your information safe?</strong> We have organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Click&nbsp;</span><a><span>here</span></a><span>&nbsp;to learn more.</span>
        </div>
        <div><br></div>
        <div><span><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Click&nbsp;</span><a><span>here</span></a><span>&nbsp;to learn more.</span>
        </div>
        <div><br></div>
        <div><span><strong>How do I exercise my rights?</strong> The easiest way to exercise your rights is by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</span>
        </div>
        <div><br></div>
        <div><span>Want to learn more about what FireCMS does with any information we collect? Click&nbsp;</span><a><span>here</span></a><span>&nbsp;to review the notice in full.</span>
        </div>
        <div><br></div>
        <div><br></div>
        <div><span><strong><span>TABLE OF CONTENTS</span></strong></span></div>
        <div><br></div>
        <div><span><a><span>1. WHAT INFORMATION DO WE COLLECT?</span></a></span>
        </div>
        <div>
            <span><a><span>2. HOW DO WE PROCESS YOUR INFORMATION?</span></a></span>
        </div>
        <div><span><a><span>3. <span>WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</span></span></a></span>
        </div>
        <div><span><a>4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></span>
        </div>
        <div><span><a><span>5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</span></a></span>
        </div>
        <div>
            <span><a><span>6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</span></a></span>
        </div>
        <div>
            <span><a><span>7. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</span></a></span>
        </div>
        <div><span><a><span>8. HOW LONG DO WE KEEP YOUR INFORMATION?</span></a></span>
        </div>
        <div><span><a><span>9. HOW DO WE KEEP YOUR INFORMATION SAFE?</span></a></span>
        </div>
        <div>
            <span><a><span>10. DO WE COLLECT INFORMATION FROM MINORS?</span></a></span>
        </div>
        <div><span><a>11. WHAT ARE YOUR PRIVACY RIGHTS?</a></span></div>
        <div>
            <span><a><span>12. CONTROLS FOR DO-NOT-TRACK FEATURES</span></a></span>
        </div>
        <div><span><a><span>13. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</span></a></span>
        </div>
        <div>
            <span><a><span>14. DO WE MAKE UPDATES TO THIS NOTICE?</span></a></span>
        </div>
        <div><a href="#contact"><span>15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a>
        </div>
        <div><a href="#request"><span>16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</span></a>
        </div>
        <div><br></div>
        <div>
            <span><strong><span>1. WHAT INFORMATION DO WE COLLECT?</span></strong></span>
        </div>
        <div><br></div>
        <div>
            <span><strong>Personal information you disclose to us</strong></span>
        </div>
        <div>
            <div><br></div>
            <div>
                <span><strong><em>In Short:</em></strong></span><span><strong><em>&nbsp;</em></strong><em>We collect personal information that you provide to us.</em></span>
            </div>
        </div>
        <div><br></div>
        <div><span>We collect personal information that you voluntarily provide to us when you register on the Services,&nbsp;</span><span>express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</span>
        </div>
        <div><br></div>
        <div><span><strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:</span>
        </div>
        <ul>
            <li><span>email addresses</span></li>
        </ul>

        <ul>
            <li><span>usernames</span></li>
        </ul>

        <ul>
            <li><span>passwords</span></li>
        </ul>

        <ul>
            <li><span>debit/credit card numbers</span></li>
        </ul>

        <ul>
            <li><span>billing addresses</span></li>
        </ul>

        <div><span><strong>Sensitive Information.</strong> When necessary, with your consent or as otherwise permitted by applicable law, we process the following categories of sensitive information:</span>
        </div>
        <div><span><strong>Payment Data.</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by Stripe<span>. You may find their privacy notice link(s) here: <a
                href="https://stripe.com/privacy" target="_blank">https://stripe.com/privacy</a><span>.</span></span></span>
        </div>
        <div><br></div>

        <div><span><strong>Social Media Login Data.&nbsp;</strong>We may provide you with the option to register with us using your existing social media account details, like your Facebook, Twitter, or other social media account. If you choose to register in this way, we will collect the information described in the section called "<span><a
                href="#sociallogins">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a></span>" below.</span>
        </div>
        <div><br></div>

        <div><span>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</span>
        </div>
        <div><br></div>
        <div><span><strong>Information automatically collected</strong></span>
        </div>
        <div>
            <div><br></div>
            <div>
                <span><strong><em>In Short:</em></strong></span><span><strong><em>&nbsp;</em></strong><em>Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</em></span>
            </div>
        </div>
        <div><br></div>
        <div><span>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.</span>
        </div>
        <div><br></div>
        <div><span>Like many businesses, we also collect information through cookies and similar technologies. </span>
        </div>
        <div><br></div>
        <div><span>The information we collect includes:</span></div>
        <ul>
            <li><span><em>Log and Usage Data.</em> Log and usage data is service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services and which we record in log files. Depending on how you interact with us, this log data may include your IP address, device information, browser type, and settings and information about your activity in the Services<span>&nbsp;</span>(such as the date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take such as which features you use), device event information (such as system activity, error reports (sometimes called "crash dumps"), and hardware settings).</span>
            </li>
        </ul>
        <div>
            <div>

                <div>
                    <span><strong><span>2. HOW DO WE PROCESS YOUR INFORMATION?</span></strong></span>
                </div>
                <div>
                    <div><br></div>
                    <div><span><strong><em>In Short:&nbsp;</em></strong><em>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</em></span>
                    </div>
                </div>
                <div><br></div>
                <div><span><strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong></span>
                </div>
                <ul>
                    <li><span><strong>To facilitate account creation and authentication and otherwise manage user accounts.&nbsp;</strong>We may process your information so you can create and log in to your account, as well as keep your account in working order.</span>
                    </li>
                </ul>
                <div>
                    <div>
                        <div>
                            <div>
                                <div>

                                    <ul>
                                        <li><span><strong>To send administrative information to you.&nbsp;</strong>We may process your information to send you details about our products and services, changes to our terms and policies, and other similar information.</span>
                                        </li>
                                    </ul>
                                    <div>

                                        <ul>
                                            <li><span><strong>To fulfill and manage your orders.</strong> We may process your information to fulfill and manage your orders, payments, returns, and exchanges made through the Services.</span>
                                            </li>
                                        </ul>
                                        <p style="font-size: 15px; line-height: 1.5;"></p>
                                        <p style="font-size: 15px; line-height: 1.5;"></p>
                                        <p style="font-size: 15px; line-height: 1.5;"></p>
                                        <p style="font-size: 15px; line-height: 1.5;"></p>
                                        <div>

                                            <ul>
                                                <li><span><strong>To send you marketing and promotional communications.&nbsp;</strong>We may process the personal information you send to us for our marketing purposes, if this is in accordance with your marketing preferences. You can opt out of our marketing emails at any time. For more information, see "</span><a
                                                        href="#privacyrights"><span>WHAT ARE YOUR PRIVACY RIGHTS?</span></a><span>" below).</span>
                                                </li>
                                            </ul>
                                            <div>
                                                <div>

                                                    <ul>
                                                        <li>
                                                            <span><strong>To save or protect an individual's vital interest.</strong> We may process your information when necessary to save or protect an individual’s vital interest, such as to prevent harm.</span>
                                                        </li>
                                                    </ul>

                                                    <div>
                                                        <br>
                                                    </div>
                                                    <div>
                                                        <strong><span>3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</span></strong>
                                                    </div>
                                                    <div>
                                                        <br>
                                                    </div>
                                                    <div>
                                                        <em><span><strong>In Short:&nbsp;</strong>We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.</span></em>
                                                    </div>
                                                    <div>
                                                        <br>
                                                    </div>
                                                    <div>
                                                        <em><span><strong><u>If you are located in the EU or UK, this section applies to you.</u></strong></span></em>
                                                    </div>
                                                    <div>
                                                        <br>
                                                    </div>
                                                    <div>
                                                        <span>The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:</span>
                                                    </div>
                                                    <ul>
                                                        <li>
                                                            <span><strong>Consent.&nbsp;</strong>We may process your information if you have given us permission (i.e., consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Click&nbsp;</span><a
                                                                href="#withdrawconsent"><span>here</span></a><span>&nbsp;to learn more.</span>
                                                        </li>
                                                    </ul>

                                                    <ul>
                                                        <li>
                                                            <span><strong>Performance of a Contract.</strong> We may process your personal information when we believe it is necessary to fulfill our contractual obligations to you, including providing our Services or at your request prior to entering into a contract with you.</span>
                                                        </li>
                                                    </ul>

                                                    <ul>
                                                        <li>
                                                            <span><strong>Legitimate Interests.</strong> We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests and those interests do not outweigh your interests and fundamental rights and freedoms. For example, we may process your personal information for some of the purposes described in order to:</span>
                                                        </li>
                                                    </ul>

                                                    <ul style="margin-left: 40px;">
                                                        <li>
                                                            <span>Send users information about special offers and discounts on our products and services</span>
                                                        </li>
                                                    </ul>
                                                    <div>
                                                        <div>
                                                            <div>
                                                                <div>
                                                                    <div>

                                                                        <ul>
                                                                            <li>
                                                                                <span><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.<br></span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.</span>
                                                                            </li>
                                                                        </ul>

                                                                        <div>
                                                                            <br>
                                                                        </div>
                                                                        <div>
                                                                            <span><strong><u><em>If you are located in Canada, this section applies to you.</em></u></strong></span>
                                                                        </div>
                                                                        <div>
                                                                            <br>
                                                                        </div>
                                                                        <div>
                                                                            <span>We may process your information if you have given us specific permission (i.e., express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e., implied consent). You can withdraw your consent at any time. Click&nbsp;</span><a
                                                                                href="#withdrawconsent"><span>here</span></a><span>&nbsp;to learn more.</span>
                                                                        </div>
                                                                        <div>
                                                                            <br>
                                                                        </div>
                                                                        <div>
                                                                            <span>In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:</span>
                                                                        </div>
                                                                        <ul>
                                                                            <li>
                                                                                <span>If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>For investigations and fraud detection and prevention</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>For business transactions provided certain conditions are met</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>For identifying injured, ill, or deceased persons and communicating with next of kin</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>If the collection is solely for journalistic, artistic, or literary purposes</span>
                                                                            </li>
                                                                        </ul>

                                                                        <ul>
                                                                            <li>
                                                                                <span>If the information is publicly available and is specified by the regulations</span>
                                                                            </li>
                                                                        </ul>

                                                                        <div>
                                                                            <br>
                                                                        </div>
                                                                        <div>
                                                                            <span><strong><span>4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</span></strong></span>
                                                                        </div>
                                                                        <div>
                                                                            <br>
                                                                        </div>
                                                                        <div>
                                                                            <span><strong><em>In Short:</em></strong><em>&nbsp;We may share information in specific situations described in this section and/or with the following third parties.</em></span>
                                                                        </div>
                                                                        <div>
                                                                            <br>
                                                                        </div>

                                                                        <div>
                                                                            <br>
                                                                        </div>
                                                                        <div>
                                                                            <span>We  may need to share your personal information in the following situations:</span>
                                                                        </div>
                                                                        <ul>
                                                                            <li>
                                                                                <span><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</span>
                                                                            </li>
                                                                            <li>
                                                                                <strong>Google.</strong>
                                                                                <span>When using the online service FireCMS Cloud. </span>
                                                                                <span>FireCMS Cloud use and transfer to any other app of information received from Google APIs will adhere to <a
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes">Google API Services User Data Policy</a>, including the Limited Use requirements.</span>
                                                                                <span>This policy applies only when using FireCMS Cloud, not in case the user is self hosting FireCMS.</span>
                                                                            </li>
                                                                        </ul>
                                                                        <div>
                                                                            <div>
                                                                                <div>
                                                                                    <div>
                                                                                        <div>

                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><em>In Short:</em></strong><em>&nbsp;We may use cookies and other tracking technologies to collect and store your information.</em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice<span>.</span></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><em>In Short:&nbsp;</em></strong><em>If you choose to register or log in to our services using a social media account, we may have access to certain information about you.</em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or Twitter logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform. </span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We will use the information we receive only for the purposes that are described in this privacy notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>7. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>


                                                                                            <div>
                                                                                                <span><strong><em>In Short:&nbsp;</em></strong><em>We may transfer, store, and process your information in countries other than your own.</em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                                                        <span>Our servers are located in<span> Spain<span></span><span>. If you are accessing our Services from outside</span><span> Spain<span><span><span></span><span>, please be aware that your information may be transferred to, stored, and processed by us in our facilities and by those third parties with whom we may share your personal information (see "</span></span></span><a
                                                                                                                                                href="#whoshare"><span>WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</span></a><span>" above), in</span><span><span><span> the <span>United States,</span></span></span></span><span>&nbsp;and other countries.</span></span></span></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>

                                                                                            <span>FireCMS Cloud use and transfer to any other app of information received from Google APIs will adhere to <a
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes">Google API Services User Data Policy</a>, including the Limited Use requirements.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>If you are a resident in the European Economic Area (EEA) or United Kingdom (UK), then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this privacy notice and applicable law.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>8. HOW LONG DO WE KEEP YOUR INFORMATION?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><em>In Short:&nbsp;</em></strong><em>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.</em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>9. HOW DO WE KEEP YOUR INFORMATION SAFE?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><em>In Short:&nbsp;</em></strong><em>We aim to protect your personal information through a system of organizational and technical security measures.</em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>10. DO WE COLLECT INFORMATION FROM MINORS?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><em>In Short:</em></strong><em>&nbsp;We do not knowingly collect data from or market to children under 18 years of age.</em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at <span>hello@firecms.co</span>.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>11. WHAT ARE YOUR PRIVACY RIGHTS?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><em>In Short:</em></strong><em>&nbsp;In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and Canada, you have rights that allow you greater access to and control over your personal information.&nbsp;You may review, change, or terminate your account at any time. </em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section "</span><a
                                                                                                    href="#contact"><span>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a><span>" below.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We will consider and act upon any request in accordance with applicable data protection laws.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>&nbsp;</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                                                        <span>If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority. You can find their contact details here: <span><a
                                                                                                                                                href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm"
                                                                                                                                                rel="noopener noreferrer"
                                                                                                                                                target="_blank"><span>https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm</span></a></span>.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                                                        <span>If you are located in Switzerland, the contact details for the data protection authorities are available here: <span><a
                                                                                                                                                href="https://www.edoeb.admin.ch/edoeb/en/home.html"
                                                                                                                                                rel="noopener noreferrer"
                                                                                                                                                target="_blank">https://www.edoeb.admin.ch/edoeb/en/home.html</a></span>.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><u>Withdrawing your consent:</u></strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section "</span><a
                                                                                                    href="#contact"><span>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a><span>" below or updating your preferences.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>However, please note that this will not affect the lawfulness of the processing before its withdrawal, nor when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><u>Opting out of marketing and promotional communications:</u></strong><strong><u>&nbsp;</u></strong>You can unsubscribe from our marketing and promotional communications at any time by clicking on the unsubscribe link in the emails that we send, or by contacting us using the details provided in the section "</span><a
                                                                                                    href="#contact"><span>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a><span>" below. You will then be removed from the marketing lists. However, we may still communicate with you — for example, to send you service-related messages that are necessary for the administration and use of your account, to respond to service requests, or for other non-marketing purposes.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong>Account Information</strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>If you would at any time like to review or change the information in your account or terminate your account, you can:</span>
                                                                                            </div>
                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>Log in to your account settings and update your user account.</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <div>
                                                                                                <span>Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                                                        <span><strong><u>Cookies and similar technologies:</u></strong> Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services. To opt out of interest-based advertising by advertisers on our Services visit <span><a
                                                                                                                                                href="http://www.aboutads.info/choices/"
                                                                                                                                                rel="noopener noreferrer"
                                                                                                                                                target="_blank"><span>http://www.aboutads.info/choices/</span></a></span>. </span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>12. CONTROLS FOR DO-NOT-TRACK FEATURES</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this privacy notice.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>13. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><em>In Short:&nbsp;</em></strong><em>Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information.</em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>California Civil Code Section 1798.83, also known as the "Shine The Light" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us using the contact information provided below.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>If you are under 18 years of age, reside in California, and have a registered account with Services, you have the right to request removal of unwanted data that you publicly post on the Services. To request removal of such data, please contact us using the contact information provided below and include the email address associated with your account and a statement that you reside in California. We will make sure the data is not publicly displayed on the Services, but please be aware that the data may not be completely or comprehensively removed from all our systems (e.g., backups, etc.).</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong>CCPA Privacy Notice</strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <div>
                                                                                                    <br>
                                                                                                </div>
                                                                                                <div>
                                                                                                    <span>The California Code of Regulations defines a "resident" as:</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div style="line-height: 1.5; margin-left: 20px;">
                                                                                                <span>(1) every individual who is in the State of California for other than a temporary or transitory purpose and</span>
                                                                                            </div>
                                                                                            <div style="line-height: 1.5; margin-left: 20px;">
                                                                                                <span>(2) every individual who is domiciled in the State of California who is outside the State of California for a temporary or transitory purpose</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>All other individuals are defined as "non-residents."</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>If this definition of "resident" applies to you, we must adhere to certain rights and obligations regarding your personal information.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong>What categories of personal information do we collect?</strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We have collected the following categories of personal information in the past twelve (12) months:</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <table style="width: 100%;">
                                                                                                <tbody>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <span><strong>Category</strong></span>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-top: 1px solid black; border-right: 1px solid black;">
                                                                                                        <span><strong>Examples</strong></span>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; border-right: 1px solid black; border-top: 1px solid black; text-align: center;">
                                                                                                        <span><strong>Collected</strong></span>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>A. Identifiers</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-top: 1px solid black; border-right: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; vertical-align: middle; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>YES</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>B. Personal information categories listed in the California Customer Records statute</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Name, contact information, education, employment, employment history, and financial information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>YES</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>C. Protected classification characteristics under California or federal law</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Gender and date of birth</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>D. Commercial information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Transaction information, purchase history, financial details, and payment information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>E. Biometric information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Fingerprints and voiceprints</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>F. Internet or other similar network activity</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>G. Geolocation data</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Device location</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>H. Audio, electronic, visual, thermal, olfactory, or similar information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Images and audio, video or call recordings created in connection with our business activities</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>I. Professional or employment-related information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <span>Business contact details in order to provide you our services at a business level or job title, work history, and professional qualifications if you apply for a job with us</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black; width: 33.8274%;">
                                                                                                        <div>
                                                                                                            <span>J. Education Information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="border-right: 1px solid black; border-top: 1px solid black; width: 51.4385%;">
                                                                                                        <div>
                                                                                                            <span>Student records and directory information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black; width: 14.9084%;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td style="border-width: 1px; border-color: black; border-style: solid; width: 33.8274%;">
                                                                                                        <div>
                                                                                                            <span>K. Inferences drawn from other personal information</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="border-bottom: 1px solid black; border-top: 1px solid black; border-right: 1px solid black; width: 51.4385%;">
                                                                                                        <div>
                                                                                                            <span>Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td style="text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; width: 14.9084%;">
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <span>NO</span>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <br>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                </tbody>
                                                                                            </table>

                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We may also collect other personal information outside of these categories instances where you interact with us in person, online, or by phone or mail in the context of:</span>
                                                                                            </div>
                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>Receiving help through our customer support channels;</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>Participation in customer surveys or contests; and</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>Facilitation in the delivery of our Services and to respond to your inquiries.</span>
                                                                                                </li>
                                                                                            </ul>
                                                                                            <div>
                                                                                                <span><strong>How do we use and share your personal information?</strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>More information about our data collection and sharing practices can be found in this privacy notice.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>You may contact us by email at&nbsp;</span><span>hello@firecms.co, </span><span>or by referring to the contact details at the bottom of this document.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>If you are using an authorized agent to exercise your right to opt out we may deny a request if the authorized agent does not submit proof that they have been validly authorized to act on your behalf.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong>Will your information be shared with anyone else?</strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Each service provider is a for-profit entity that processes the information on our behalf.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be "selling" of your personal information.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>FireCMS</span><span>&nbsp;has not disclosed or sold any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. <span>FireCMS</span>&nbsp;</span>will
                                                                                                not
                                                                                                sell
                                                                                                personal
                                                                                                information
                                                                                                in
                                                                                                the
                                                                                                future
                                                                                                belonging
                                                                                                to
                                                                                                website
                                                                                                visitors,
                                                                                                users,
                                                                                                and
                                                                                                other
                                                                                                consumers.
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong>Your rights with respect to your personal data</strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><u>Right to request deletion of the data — Request to delete</u></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>You can ask for the deletion of your personal information. If you ask us to delete your personal information, we will respect your request and delete your personal information, subject to certain exceptions provided by law, such as (but not limited to) the exercise by another consumer of his or her right to free speech, our compliance requirements resulting from a legal obligation, or any processing that may be required to protect against illegal activities.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><u>Right to be informed — Request to know</u></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>Depending on the circumstances, you have a right to know:</span>
                                                                                            </div>
                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>whether we collect and use your personal information;</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>the categories of personal information that we collect;</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>the purposes for which the collected personal information is used;</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>whether we sell your personal information to third parties;</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>the categories of personal information that we sold or disclosed for a business purpose;</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>the categories of third parties to whom the personal information was sold or disclosed for a business purpose; and</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>the business or commercial purpose for collecting or selling personal information.</span>
                                                                                                </li>
                                                                                            </ul>
                                                                                            <div>
                                                                                                <span>In accordance with applicable law, we are not obligated to provide or delete consumer information that is de-identified in response to a consumer request or to re-identify individual data to verify a consumer request.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><u>Right to Non-Discrimination for the Exercise of a Consumer’s Privacy Rights</u></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We will not discriminate against you if you exercise your privacy rights.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><u>Verification process</u></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. These verification efforts require us to ask you to provide information so that we can match it with information you have previously provided us. For instance, depending on the type of request you submit, we may ask you to provide certain information so that we can match the information you provide with the information we already have on file, or we may contact you through a communication method (e.g., phone or email) that you have previously provided to us. We may also use other verification methods as the circumstances dictate.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We will only use personal information provided in your request to verify your identity or authority to make the request. To the extent possible, we will avoid requesting additional information from you for the purposes of verification. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes. We will delete such additionally provided information as soon as we finish verifying you.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><u>Other privacy rights</u></span>
                                                                                            </div>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>You may object to the processing of your personal information.</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>You may request correction of your personal data if it is incorrect or no longer relevant, or ask to restrict the processing of the information.</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>You can designate an authorized agent to make a request under the CCPA on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with the CCPA.</span>
                                                                                                </li>
                                                                                            </ul>

                                                                                            <ul>
                                                                                                <li>
                                                                                                    <span>You may request to opt out from future selling of your personal information to third parties. Upon receiving an opt-out request, we will act upon the request as soon as feasibly possible, but no later than fifteen (15) days from the date of the request submission.</span>
                                                                                                </li>
                                                                                            </ul>
                                                                                            <div>
                                                                                                <span>To exercise these rights, you can contact us&nbsp;</span><span>by email at hello@firecms.co, </span><span>or by referring to the contact details at the bottom of this document. If you have a complaint about how we handle your data, we would like to hear from you.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>14. DO WE MAKE UPDATES TO THIS NOTICE?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><em><strong>In Short:&nbsp;</strong>Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>If you have questions or comments about this notice, you may <span>email us at hello@firecms.co</span><span>&nbsp;</span></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span><strong><span>16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</span></strong></span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <br>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. To request to review, update, or delete your personal information, please submit a request via email to hello@firecms.co&nbsp;</span><span>.</span>
                                                                                            </div>
                                                                                            <style> ul {
                                                                                                list-style-type: square;
                                                                                            }

                                                                                            ul > li > ul {
                                                                                                list-style-type: circle;
                                                                                            }

                                                                                            ul > li > ul > li > ul {
                                                                                                list-style-type: square;
                                                                                            } </style>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

`

