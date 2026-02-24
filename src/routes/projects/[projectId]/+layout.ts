import type { Id } from '$convex/_generated/dataModel.js';
import type { LayoutLoad } from './$types.js';

// 🚨 THIS IS THE MAGIC LINE: It disables SSR for this route and all child routes
export const ssr = false;

export const load: LayoutLoad = ({ params }) => {
	// Grab the ID from the folder name [projectId]
	// We cast it to the Convex Id type so useQuery doesn't complain
	return {
		projectId: params.projectId as Id<'projects'>
	};
};
