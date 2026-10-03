import { n as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as useQuery, t as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { l as Heart, o as LoaderCircle, u as Camera } from "../_libs/lucide-react.mjs";
import { a as PhotoLightbox, c as fetchFeedPage, d as listMembers, f as listTeams, h as timeAgoHe, i as NamePicker, m as signImagePaths, n as Button, o as Skeleton, r as MemberAvatar, s as cn, t as AppShell, u as likesLabel, v as useLikeMutation, y as useMemberId } from "./PhotoLightbox-Tr1kE-b5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Jpczgajr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** One post in the feed: uploader header, photo, like row. */
function PostCard({ post, memberId, imageUrl, avatarUrl, onOpen }) {
	const likeMutation = useLikeMutation(memberId);
	const liked = post.likes.some((like) => like.user_id === memberId);
	const member = post.member;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "feed-card overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 px-4 py-3",
				children: [member ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/user/$userId",
					params: { userId: member.id },
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberAvatar, {
						name: member.name,
						imageUrl: avatarUrl,
						className: "size-10"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate font-semibold leading-tight",
							children: member.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground leading-tight",
							children: member.team?.name
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground",
					children: "משתמש לא ידוע"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
					className: "ms-auto shrink-0 text-xs text-muted-foreground",
					dateTime: post.created_at,
					children: timeAgoHe(post.created_at)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onOpen(post),
				className: "block w-full cursor-zoom-in bg-muted",
				"aria-label": "פתיחת התמונה בגודל מלא",
				children: imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: imageUrl,
					alt: `תמונה של ${member?.name ?? ""}`,
					loading: "lazy",
					className: "w-full"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-64 items-center justify-center text-sm text-muted-foreground",
					children: "טוען תמונה…"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex items-center gap-2 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => likeMutation.mutate({
						postId: post.id,
						liked: !liked
					}),
					"aria-label": liked ? "הסרת לייק" : "לייק",
					"aria-pressed": liked,
					className: "group flex items-center justify-center rounded-full p-1 transition-transform active:scale-90",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-7 transition-colors", liked ? "fill-like text-like" : "text-foreground group-hover:text-like") })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-sm", post.likes.length > 0 ? "font-medium" : "text-muted-foreground"),
					children: likesLabel(post.likes.length)
				})]
			})
		]
	});
}
function FeedPage() {
	const memberId = useMemberId();
	const membersQuery = useQuery({
		queryKey: ["members"],
		queryFn: listMembers,
		enabled: Boolean(memberId)
	});
	if (!memberId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NamePicker, {});
	const member = membersQuery.data?.find((m) => m.id === memberId);
	if (membersQuery.isLoading || !membersQuery.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-primary" })
	});
	if (!member) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NamePicker, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedView, { member });
}
function FeedView({ member }) {
	const [teamId, setTeamId] = (0, import_react.useState)(null);
	const [openPost, setOpenPost] = (0, import_react.useState)(null);
	const teams = useQuery({
		queryKey: ["teams"],
		queryFn: listTeams
	}).data ?? [];
	const feedQuery = useInfiniteQuery({
		queryKey: ["feed", teamId ?? "all"],
		queryFn: ({ pageParam }) => fetchFeedPage(pageParam, teamId),
		initialPageParam: 0,
		getNextPageParam: (lastPage, _pages, lastPageParam) => lastPage.length === 12 ? lastPageParam + 1 : void 0
	});
	const posts = (0, import_react.useMemo)(() => feedQuery.data?.pages.flat() ?? [], [feedQuery.data]);
	const imagePaths = (0, import_react.useMemo)(() => posts.flatMap((post) => [post.image_url, post.member?.profile_image]).filter((p) => Boolean(p)), [posts]);
	const signedUrls = useQuery({
		queryKey: ["signed", ...imagePaths.slice().sort()],
		queryFn: () => signImagePaths(imagePaths),
		enabled: imagePaths.length > 0,
		staleTime: 3e6
	}).data ?? {};
	const memberAvatarUrl = member.profile_image ? signedUrls[member.profile_image] : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		member,
		memberAvatarUrl,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex gap-2 overflow-x-auto pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
					active: teamId === null,
					onClick: () => setTeamId(null),
					children: "הכל"
				}), teams.map((team) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
					active: teamId === team.id,
					onClick: () => setTeamId(team.id),
					children: team.name
				}, team.id))]
			}),
			feedQuery.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "feed-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-28" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-16" })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-72 w-full rounded-none" })]
				}, i))
			}),
			feedQuery.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "feed-card flex flex-col items-center gap-3 px-4 py-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "משהו השתבש. נסה שוב."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => feedQuery.refetch(),
					children: "נסה שוב"
				})]
			}),
			feedQuery.isSuccess && posts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "feed-card flex flex-col items-center gap-3 px-4 py-16 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-10 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-medium",
						children: teamId ? "עדיין לא הועלו תמונות מהצוות הזה." : "עדיין אין כאן תמונות 📷"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "היו הראשונים להעלות תמונה לפיד!"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: posts.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, {
					post,
					memberId: member.id,
					imageUrl: signedUrls[post.image_url],
					avatarUrl: post.member?.profile_image ? signedUrls[post.member.profile_image] : void 0,
					onOpen: setOpenPost
				}, post.id))
			}),
			feedQuery.hasNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "rounded-xl",
					disabled: feedQuery.isFetchingNextPage,
					onClick: () => feedQuery.fetchNextPage(),
					children: feedQuery.isFetchingNextPage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " טוען…"] }) : "טענו עוד תמונות"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoLightbox, {
				post: openPost,
				memberId: member.id,
				imageUrl: openPost ? signedUrls[openPost.image_url] : void 0,
				avatarUrl: openPost?.member?.profile_image ? signedUrls[openPost.member.profile_image] : void 0,
				onClose: () => setOpenPost(null)
			})
		]
	});
}
function FilterChip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"),
		children
	});
}
//#endregion
export { FeedPage as component };
