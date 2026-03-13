import { Bunny, React } from "@revenge/metro"; // lub odpowiedni import w Twoim buildzie

const { createElement, Children, cloneElement } = React;

// Funkcja wstrzykująca przycisk do Activity w runtime
function injectActivityButton(userProfileJSX: any) {
    if (!userProfileJSX?.props?.children) return userProfileJSX;

    const children = Children.toArray(userProfileJSX.props.children);

    // Znajdź element Activity w JSX
    const activityIndex = children.findIndex(
        (c: any) => c?.type?.displayName?.includes("Activity")
    );
    if (activityIndex < 0) return userProfileJSX;

    // Dodaj nasz przycisk do Activity
    children[activityIndex] = cloneElement(children[activityIndex], {}, [
        ...Children.toArray(children[activityIndex].props?.children ?? []),
        createElement(
            "button",
            {
                onClick: () => console.log("Custom Button clicked!"),
                style: { marginLeft: 5, padding: 5, backgroundColor: "#5865F2", color: "#fff", border: "none", borderRadius: 4 },
            },
            "Custom Button"
        ),
    ]);

    return cloneElement(userProfileJSX, {}, children);
}

// Wrapper dla UserProfile, który używa funkcji injectActivityButton
export default function UserProfileWrapper(props: any) {
    const originalJSX = props.originalJSX; // Oryginalny JSX UserProfile w runtime
    return injectActivityButton(originalJSX);
}

// W pluginie / module musisz w miejscu renderowania UserProfile podać:
// <UserProfileWrapper originalJSX={JSX_UserProfile} />
// Ten wrapper zajmie się dynamicznym dodaniem przycisku.
