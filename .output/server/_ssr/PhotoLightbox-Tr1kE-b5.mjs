import { n as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useRouter, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as DialogOverlay$1, c as Slot, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-NxyksRj6.mjs";
import { a as LogOut, c as House, i as Plus, l as Heart, n as User, o as LoaderCircle, r as Search, s as ImagePlus, t as X, u as Camera } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PhotoLightbox-Tr1kE-b5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Data layer for the company photo network.
*
* All images live in the private `company-photos` storage bucket; the database
* stores only the storage path. Because the bucket is private, rendering code
* exchanges paths for short-lived signed URLs via `signImagePaths`.
*/
var BUCKET = "company-photos";
var SIGNED_URL_TTL_SECONDS = 3600;
var POST_SELECT = "id,image_url,created_at,user_id,member:members!inner(id,name,profile_image,team:teams(name)),likes(user_id)";
async function listTeams() {
	const { data, error } = await supabase.from("teams").select("id,name").order("name");
	if (error) throw error;
	return data ?? [];
}
async function listMembers() {
	const { data, error } = await supabase.from("members").select("id,name,team_id,profile_image,created_at,team:teams(name)").order("name");
	if (error) throw error;
	return data ?? [];
}
async function fetchFeedPage(page, teamId) {
	let query = supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).range(page * 12, (page + 1) * 12 - 1);
	if (teamId) query = query.eq("member.team_id", teamId);
	const { data, error } = await query;
	if (error) throw error;
	return data ?? [];
}
async function fetchProfile(userId) {
	const { data: member, error: memberError } = await supabase.from("members").select("id,name,team_id,profile_image,created_at,team:teams(name)").eq("id", userId).single();
	if (memberError) throw memberError;
	const { data: posts, error: postsError } = await supabase.from("posts").select("id,image_url,created_at,user_id,likes(user_id)").eq("user_id", userId).order("created_at", { ascending: false });
	if (postsError) throw postsError;
	return {
		member,
		posts: posts ?? []
	};
}
/** Exchange storage paths for signed URLs the <img> tags can render. */
async function signImagePaths(paths) {
	const unique = [...new Set(paths.filter((p) => Boolean(p)))];
	if (unique.length === 0) return {};
	const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);
	if (error) throw error;
	const map = {};
	data?.forEach((entry, index) => {
		const path = unique[index];
		if (path && entry.signedUrl) map[path] = entry.signedUrl;
	});
	return map;
}
async function uploadImage(userId, file) {
	const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
	const path = `${userId}/${crypto.randomUUID()}.${ext}`;
	const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
		contentType: file.type,
		cacheControl: "31536000"
	});
	if (error) throw error;
	return path;
}
async function createPost(userId, imagePath) {
	const { error } = await supabase.from("posts").insert({
		user_id: userId,
		image_url: imagePath
	});
	if (error) throw error;
}
async function setLike(postId, userId, liked) {
	if (liked) {
		const { error } = await supabase.from("likes").insert({
			post_id: postId,
			user_id: userId
		});
		if (error && error.code !== "23505") throw error;
	} else {
		const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
		if (error) throw error;
	}
}
async function updateProfileImage(userId, imagePath) {
	const { error } = await supabase.from("members").update({ profile_image: imagePath }).eq("id", userId);
	if (error) throw error;
}
/**
* Current-member session.
*
* The app intentionally has no password/OAuth login: a company member picks
* their name from a predefined list, and the chosen member id is stored
* locally on the device. This is an internal tool on a trusted network, so a
* lightweight local session is the deliberate design (see project spec §2).
*/
var STORAGE_KEY = "hapluga.memberId";
var listeners = /* @__PURE__ */ new Set();
function getSnapshot() {
	return window.localStorage.getItem(STORAGE_KEY);
}
function getServerSnapshot() {
	return null;
}
function subscribe(callback) {
	listeners.add(callback);
	window.addEventListener("storage", callback);
	return () => {
		listeners.delete(callback);
		window.removeEventListener("storage", callback);
	};
}
function notify() {
	listeners.forEach((listener) => listener());
}
/** Reactive current member id (null when nobody has picked a name). */
function useMemberId() {
	return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot);
}
function signInAs(memberId) {
	window.localStorage.setItem(STORAGE_KEY, memberId);
	notify();
}
function signOut() {
	window.localStorage.removeItem(STORAGE_KEY);
	notify();
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
/** Round avatar: the member's photo when available, otherwise their first letter. */
function MemberAvatar({ name, imageUrl, className }) {
	if (imageUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: imageUrl,
		alt: name,
		loading: "lazy",
		className: cn("size-10 shrink-0 rounded-full object-cover ring-1 ring-border", className)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: cn("flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-border", className),
		children: name.trim().charAt(0)
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
/** Upload flow: pick an image → preview → confirm → storage + post row. */
function UploadDialog({ open, onOpenChange, memberId }) {
	const queryClient = useQueryClient();
	const fileInputRef = (0, import_react.useRef)(null);
	const [file, setFile] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	function reset() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		setFile(null);
		setPreviewUrl(null);
		setUploading(false);
	}
	function handleClose(nextOpen) {
		if (!nextOpen) reset();
		onOpenChange(nextOpen);
	}
	function handleFileChosen(chosen) {
		if (!chosen) return;
		if (!chosen.type.startsWith("image/")) {
			toast.error("הקובץ שנבחר אינו תמונה.");
			return;
		}
		if (chosen.size > 10485760) {
			toast.error("התמונה גדולה מדי. הגודל המרבי הוא 10MB.");
			return;
		}
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		setFile(chosen);
		setPreviewUrl(URL.createObjectURL(chosen));
	}
	async function handleConfirm() {
		if (!file || uploading) return;
		setUploading(true);
		try {
			await createPost(memberId, await uploadImage(memberId, file));
			await queryClient.invalidateQueries({ queryKey: ["feed"] });
			await queryClient.invalidateQueries({ queryKey: ["profile", memberId] });
			toast.success("התמונה עלתה בהצלחה 🎉");
			handleClose(false);
		} catch {
			toast.error("ההעלאה נכשלה. נסה שוב.");
			setUploading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: handleClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-3xl sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "העלאת תמונה" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileInputRef,
					type: "file",
					accept: "image/*",
					className: "hidden",
					onChange: (event) => handleFileChosen(event.target.files?.[0])
				}),
				!previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => fileInputRef.current?.click(),
					className: "flex h-56 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-input bg-muted/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "בחרו תמונה מהמכשיר"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: previewUrl,
							alt: "תצוגה מקדימה",
							className: "max-h-80 w-full rounded-2xl object-contain bg-muted"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: reset,
							"aria-label": "הסרת התמונה",
							className: "absolute end-2 top-2 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "h-11 flex-1 rounded-xl",
							disabled: uploading,
							onClick: () => fileInputRef.current?.click(),
							children: "החלפת תמונה"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "h-11 flex-1 rounded-xl",
							disabled: uploading,
							onClick: handleConfirm,
							children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " מעלה…"] }) : "אישור והעלאה"
						})]
					})]
				})
			]
		})
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
/** Member search — filters the roster by name, works with Hebrew text. */
function SearchDialog({ open, onOpenChange }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const membersQuery = useQuery({
		queryKey: ["members"],
		queryFn: listMembers
	});
	const members = membersQuery.data ?? [];
	const avatarPaths = (0, import_react.useMemo)(() => members.map((m) => m.profile_image).filter((p) => Boolean(p)), [members]);
	const avatarUrls = useQuery({
		queryKey: ["signed", ...avatarPaths.slice().sort()],
		queryFn: () => signImagePaths(avatarPaths),
		enabled: avatarPaths.length > 0,
		staleTime: 3e6
	}).data ?? {};
	const normalized = query.trim();
	const results = normalized ? members.filter((member) => member.name.includes(normalized)) : members;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "rounded-3xl sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "חיפוש חברי פלוגה" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						autoFocus: true,
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "חיפוש לפי שם…",
						className: "h-11 rounded-xl pe-9"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-80 space-y-1 overflow-y-auto",
					children: [
						membersQuery.isLoading && Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full rounded-xl" }, i)),
						membersQuery.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-6 text-center text-sm text-muted-foreground",
							children: "משהו השתבש. נסה שוב."
						}),
						!membersQuery.isLoading && !membersQuery.isError && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-6 text-center text-sm text-muted-foreground",
							children: "לא נמצאו חברים בשם הזה."
						}),
						results.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/user/$userId",
							params: { userId: member.id },
							onClick: () => onOpenChange(false),
							className: "flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberAvatar, {
								name: member.name,
								imageUrl: member.profile_image ? avatarUrls[member.profile_image] : void 0,
								className: "size-10"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: member.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground",
								children: member.team?.name
							})] })]
						}, member.id))
					]
				})
			]
		})
	});
}
/**
* App chrome: top bar on desktop, bottom tab bar on mobile.
* Hosts the upload and search dialogs so they're reachable from anywhere.
*/
function AppShell({ member, memberAvatarUrl, children }) {
	const router = useRouter();
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const pathname = router.state.location.pathname;
	const isHome = pathname === "/";
	const isOwnProfile = pathname === `/user/${member.id}`;
	function handleSignOut() {
		signOut();
		router.navigate({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border nav-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2 font-bold text-lg text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" })
						}), "הפלוגה"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSearchOpen(true),
								"aria-label": "חיפוש",
								className: "flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setUploadOpen(true),
								"aria-label": "העלאת תמונה",
								className: "flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/user/$userId",
								params: { userId: member.id },
								"aria-label": "הפרופיל שלי",
								className: "ms-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberAvatar, {
									name: member.name,
									imageUrl: memberAvatarUrl,
									className: "size-9"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleSignOut,
								"aria-label": "החלפת משתמש",
								title: "החלפת משתמש",
								className: "flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-5" })
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-2xl px-3 pb-24 pt-4 sm:px-4 md:pb-10",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border nav-blur md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid h-16 max-w-2xl grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
							active: isHome,
							label: "בית",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-6" }),
							onClick: () => router.navigate({ to: "/" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
							label: "העלאה",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-6" }),
							onClick: () => setUploadOpen(true)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
							label: "חיפוש",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-6" }),
							onClick: () => setSearchOpen(true)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
							active: isOwnProfile,
							label: "פרופיל",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-6" }),
							onClick: () => router.navigate({
								to: "/user/$userId",
								params: { userId: member.id }
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadDialog, {
				open: uploadOpen,
				onOpenChange: setUploadOpen,
				memberId: member.id
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchDialog, {
				open: searchOpen,
				onOpenChange: setSearchOpen
			})
		]
	});
}
function NavItem({ label, icon, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex flex-col items-center justify-center gap-0.5 text-xs transition-colors", active ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"),
		children: [icon, label]
	});
}
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
/** Entry screen: a member picks their name from the predefined company roster. */
function NamePicker() {
	const [selectedId, setSelectedId] = (0, import_react.useState)("");
	const membersQuery = useQuery({
		queryKey: ["members"],
		queryFn: listMembers
	});
	const teamsQuery = useQuery({
		queryKey: ["teams"],
		queryFn: listTeams
	});
	const members = membersQuery.data ?? [];
	const teams = teamsQuery.data ?? [];
	const avatarPaths = (0, import_react.useMemo)(() => members.map((m) => m.profile_image).filter((p) => Boolean(p)), [members]);
	const avatarUrls = useQuery({
		queryKey: ["signed", ...avatarPaths.slice().sort()],
		queryFn: () => signImagePaths(avatarPaths),
		enabled: avatarPaths.length > 0,
		staleTime: 3e6
	}).data ?? {};
	const loading = membersQuery.isLoading || teamsQuery.isLoading;
	const failed = membersQuery.isError || teamsQuery.isError;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full max-w-md rounded-3xl shadow-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "items-center text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-2xl",
						children: "הפלוגה"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-base",
						children: "בחרו את השם שלכם כדי להיכנס"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-11 w-full rounded-xl" })]
					}),
					failed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "משהו השתבש. נסה שוב."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => membersQuery.refetch(),
							children: "נסה שוב"
						})]
					}),
					!loading && !failed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: selectedId,
							onChange: (event) => setSelectedId(event.target.value),
							className: "h-12 w-full rounded-xl border border-input bg-card px-3 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30",
							"aria-label": "בחרו את השם שלכם",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								disabled: true,
								children: "בחרו את השם שלכם…"
							}), teams.map((team) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
								label: team.name,
								children: members.filter((member) => member.team_id === team.id).map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: member.id,
									children: member.name
								}, member.id))
							}, team.id))]
						}),
						selectedId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-3 rounded-xl bg-muted px-3 py-2",
							children: (() => {
								const member = members.find((m) => m.id === selectedId);
								if (!member) return null;
								const url = member.profile_image ? avatarUrls[member.profile_image] : void 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: url,
									alt: member.name,
									className: "size-9 rounded-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
									children: member.name.charAt(0)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: member.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-muted-foreground",
										children: member.team?.name
									})]
								})] });
							})()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "h-12 w-full rounded-xl text-base",
							disabled: !selectedId || membersQuery.isFetching,
							onClick: () => selectedId && signInAs(selectedId),
							children: membersQuery.isFetching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "כניסה"
						})
					] })
				]
			})]
		})
	});
}
/** Hebrew formatting helpers. */
function timeAgoHe(isoDate) {
	const then = new Date(isoDate).getTime();
	const diffMs = Date.now() - then;
	const minutes = Math.floor(diffMs / 6e4);
	if (minutes < 1) return "עכשיו";
	if (minutes === 1) return "לפני דקה";
	if (minutes < 60) return `לפני ${minutes} דקות`;
	const hours = Math.floor(minutes / 60);
	if (hours === 1) return "לפני שעה";
	if (hours === 2) return "לפני שעתיים";
	if (hours < 24) return `לפני ${hours} שעות`;
	const days = Math.floor(hours / 24);
	if (days === 1) return "אתמול";
	if (days < 7) return `לפני ${days} ימים`;
	return new Date(isoDate).toLocaleDateString("he-IL", {
		day: "numeric",
		month: "long",
		year: "numeric"
	});
}
function likesLabel(count) {
	if (count === 0) return "היו הראשונים לעשות לייק";
	if (count === 1) return "לייק אחד";
	return `${count} לייקים`;
}
function photosLabel(count) {
	if (count === 0) return "אין תמונות";
	if (count === 1) return "תמונה אחת";
	return `${count} תמונות`;
}
function toggleInLikes(likes, memberId, liked) {
	if (liked) {
		if (likes.some((l) => l.user_id === memberId)) return likes;
		return [...likes, { user_id: memberId }];
	}
	return likes.filter((l) => l.user_id !== memberId);
}
/** Optimistically apply/remove the current member's like in every cached feed/profile. */
function applyLikeToCaches(queryClient, postId, memberId, liked) {
	queryClient.setQueriesData({ queryKey: ["feed"] }, (old) => {
		if (!old) return old;
		return {
			...old,
			pages: old.pages.map((page) => page.map((post) => post.id === postId ? {
				...post,
				likes: toggleInLikes(post.likes, memberId, liked)
			} : post))
		};
	});
	queryClient.setQueriesData({ queryKey: ["profile"] }, (old) => {
		if (!old) return old;
		return {
			...old,
			posts: old.posts.map((post) => post.id === postId ? {
				...post,
				likes: toggleInLikes(post.likes, memberId, liked)
			} : post)
		};
	});
}
function useLikeMutation(memberId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, liked }) => setLike(postId, memberId, liked),
		onMutate: async ({ postId, liked }) => {
			await queryClient.cancelQueries({ queryKey: ["feed"] });
			await queryClient.cancelQueries({ queryKey: ["profile"] });
			const feedSnapshots = queryClient.getQueriesData({ queryKey: ["feed"] });
			const profileSnapshots = queryClient.getQueriesData({ queryKey: ["profile"] });
			applyLikeToCaches(queryClient, postId, memberId, liked);
			return {
				feedSnapshots,
				profileSnapshots
			};
		},
		onError: (_error, { postId, liked }, context) => {
			context?.feedSnapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
			context?.profileSnapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
			toast.error("משהו השתבש. נסה שוב.");
		}
	});
}
/** Full-size photo viewer with uploader details and like action. */
function PhotoLightbox({ post, memberId, imageUrl, avatarUrl, onClose }) {
	const likeMutation = useLikeMutation(memberId);
	if (!post) return null;
	const liked = post.likes.some((like) => like.user_id === memberId);
	const member = post.member;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-3xl gap-0 overflow-hidden rounded-3xl p-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "sr-only",
					children: "צפייה בתמונה"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bg-muted",
					children: imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: imageUrl,
						alt: `תמונה של ${member?.name ?? ""}`,
						className: "max-h-[70vh] w-full object-contain"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-64 items-center justify-center text-sm text-muted-foreground",
						children: "טוען תמונה…"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-4 py-3",
					children: [member && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/user/$userId",
						params: { userId: member.id },
						onClick: onClose,
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ms-auto flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
							className: "hidden text-xs text-muted-foreground sm:block",
							dateTime: post.created_at,
							children: timeAgoHe(post.created_at)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => likeMutation.mutate({
								postId: post.id,
								liked: !liked
							}),
							"aria-label": liked ? "הסרת לייק" : "לייק",
							"aria-pressed": liked,
							className: "flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 transition-transform active:scale-95",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-5", liked ? "fill-like text-like" : "text-foreground") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: likesLabel(post.likes.length)
							})]
						})]
					})]
				})
			]
		})
	});
}
//#endregion
export { uploadImage as _, PhotoLightbox as a, fetchFeedPage as c, listMembers as d, listTeams as f, updateProfileImage as g, timeAgoHe as h, NamePicker as i, fetchProfile as l, signImagePaths as m, Button as n, Skeleton as o, photosLabel as p, MemberAvatar as r, cn as s, AppShell as t, likesLabel as u, useLikeMutation as v, useMemberId as y };
