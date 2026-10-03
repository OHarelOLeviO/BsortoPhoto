import { n as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Route } from "./user._userId-Cu4cjdDE.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as LoaderCircle, u as Camera } from "../_libs/lucide-react.mjs";
import { _ as uploadImage, a as PhotoLightbox, d as listMembers, g as updateProfileImage, i as NamePicker, l as fetchProfile, m as signImagePaths, n as Button, o as Skeleton, p as photosLabel, r as MemberAvatar, t as AppShell, y as useMemberId } from "./PhotoLightbox-Tr1kE-b5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/user._userId-Cb60h5WN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { userId } = Route.useParams();
	const memberId = useMemberId();
	const queryClient = useQueryClient();
	const avatarInputRef = (0, import_react.useRef)(null);
	const [changingAvatar, setChangingAvatar] = (0, import_react.useState)(false);
	const [openPost, setOpenPost] = (0, import_react.useState)(null);
	const membersQuery = useQuery({
		queryKey: ["members"],
		queryFn: listMembers,
		enabled: Boolean(memberId)
	});
	const currentMember = membersQuery.data?.find((m) => m.id === memberId);
	const profileQuery = useQuery({
		queryKey: ["profile", userId],
		queryFn: () => fetchProfile(userId),
		enabled: Boolean(memberId)
	});
	const profile = profileQuery.data;
	const imagePaths = (0, import_react.useMemo)(() => {
		if (!profile) return [];
		return [profile.member.profile_image, ...profile.posts.map((p) => p.image_url)].filter((p) => Boolean(p));
	}, [profile]);
	const signedUrls = useQuery({
		queryKey: ["signed", ...imagePaths.slice().sort()],
		queryFn: () => signImagePaths(imagePaths),
		enabled: imagePaths.length > 0,
		staleTime: 3e6
	}).data ?? {};
	if (!memberId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NamePicker, {});
	if (membersQuery.isSuccess && !currentMember) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NamePicker, {});
	if (!currentMember) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-primary" })
	});
	const isOwnProfile = currentMember.id === userId;
	async function handleAvatarChosen(file) {
		if (!file || !isOwnProfile || changingAvatar) return;
		if (!file.type.startsWith("image/")) {
			toast.error("הקובץ שנבחר אינו תמונה.");
			return;
		}
		if (file.size > 10485760) {
			toast.error("התמונה גדולה מדי. הגודל המרבי הוא 10MB.");
			return;
		}
		setChangingAvatar(true);
		try {
			const path = await uploadImage(currentMember.id, file);
			await updateProfileImage(currentMember.id, path);
			await queryClient.invalidateQueries({ queryKey: ["members"] });
			await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
			toast.success("תמונת הפרופיל עודכנה");
		} catch {
			toast.error("ההעלאה נכשלה. נסה שוב.");
		} finally {
			setChangingAvatar(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		member: currentMember,
		memberAvatarUrl: currentMember.profile_image ? signedUrls[currentMember.profile_image] : void 0,
		children: [
			profileQuery.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-20 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-1.5",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-square rounded-xl" }, i))
				})]
			}),
			profileQuery.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "feed-card flex flex-col items-center gap-3 px-4 py-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "משהו השתבש. נסה שוב."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => profileQuery.refetch(),
					children: "נסה שוב"
				})]
			}),
			profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center gap-4 px-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberAvatar, {
							name: profile.member.name,
							imageUrl: profile.member.profile_image ? signedUrls[profile.member.profile_image] : void 0,
							className: "size-20 text-2xl"
						}), isOwnProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => avatarInputRef.current?.click(),
							disabled: changingAvatar,
							"aria-label": "החלפת תמונת פרופיל",
							className: "absolute -bottom-1 -start-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-colors hover:bg-primary/90",
							children: changingAvatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold leading-tight",
							children: profile.member.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: profile.member.team?.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-medium text-primary",
							children: photosLabel(profile.posts.length)
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: avatarInputRef,
					type: "file",
					accept: "image/*",
					className: "hidden",
					onChange: (event) => handleAvatarChosen(event.target.files?.[0])
				}),
				profile.posts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "feed-card flex flex-col items-center gap-3 px-4 py-16 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-10 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-medium",
						children: isOwnProfile ? "עדיין לא העלית תמונות." : "עדיין לא הועלו תמונות."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-1.5",
					children: profile.posts.map((post) => {
						const asFeedPost = {
							...post,
							member: {
								id: profile.member.id,
								name: profile.member.name,
								profile_image: profile.member.profile_image,
								team: profile.member.team
							}
						};
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOpenPost(asFeedPost),
							className: "group relative aspect-square overflow-hidden rounded-xl bg-muted",
							"aria-label": `פתיחת תמונה של ${profile.member.name}`,
							children: signedUrls[post.image_url] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: signedUrls[post.image_url],
								alt: `תמונה של ${profile.member.name}`,
								loading: "lazy",
								className: "size-full object-cover transition-transform group-hover:scale-105"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-full items-center justify-center text-xs text-muted-foreground",
								children: "טוען…"
							})
						}, post.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoLightbox, {
					post: openPost,
					memberId: currentMember.id,
					imageUrl: openPost ? signedUrls[openPost.image_url] : void 0,
					avatarUrl: profile.member.profile_image ? signedUrls[profile.member.profile_image] : void 0,
					onClose: () => setOpenPost(null)
				})
			] })
		]
	});
}
//#endregion
export { ProfilePage as component };
