import { template } from "lodash";

function myComponent(props) {
  const compiler =
    myComponent.cache ||
    (myComponent.cache = template("<h1><%= title %></h1>"));
  return compiler(props);
}

document.getElementById("app").innerHTML = myComponent({
  title: "Hello Component",
});

if (module.hot) {
  module.hot.accept();
}
