import { useNavigationContext } from "../../hooks";
import { BreadcrumbUpdater } from "./BreadcrumbUpdater";
import { FireCMSHomePage } from "../components";
import { Route } from "react-router-dom";

export function HomeRoute({ HomePage }: { HomePage?: React.ComponentType }) {
    const navigation = useNavigationContext();
    return <Route path={navigation.homeUrl}
                  element={
                      <BreadcrumbUpdater
                          path={navigation.homeUrl}
                          title={"Home"}>

                          {HomePage ? <HomePage/> : <FireCMSHomePage/>}
                      </BreadcrumbUpdater>
                  }/>;
}
