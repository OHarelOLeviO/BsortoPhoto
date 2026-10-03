import { _ as createFileRoute, g as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/user._userId-Cu4cjdDE.js
var $$splitComponentImporter = () => import("./user._userId-Cb60h5WN.mjs");
var Route = createFileRoute("/user/$userId")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "פרופיל — הפלוגה" },
		{
			name: "description",
			content: "הפרופיל האישי של חבר הפלוגה — כל התמונות שהעלה."
		},
		{
			property: "og:title",
			content: "פרופיל — הפלוגה"
		},
		{
			property: "og:description",
			content: "הפרופיל האישי של חבר הפלוגה — כל התמונות שהעלה."
		},
		{
			property: "og:type",
			content: "profile"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
