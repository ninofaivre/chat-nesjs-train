import type { LoadEvent } from "@sveltejs/kit"
import { client } from "$lib/clients"

export const load = async ({ depends }: LoadEvent) => {
	console.log("Current page load function is being called...")

	depends("friends:invitations")
	const { status: retcode1, body: friendships } = await client.friends.getFriends()
	if (retcode1 !== 200) {
		console.log(
			`Failed to load friendship list. Server returned code ${retcode1} with message \"${
				(friendships as any)?.message
			}\"`,
		)
	} else console.log("Loaded friendship list")

	depends("friends:friendships")
	const { status: retcode2, body: friend_requests } =
		await client.invitations.friend.getFriendInvitations({
			query: { status: ["PENDING"] },
		})
	if (retcode2 !== 200) {
		console.log(
			`Failed to load friendship request list. Server returned code ${retcode2} with message \"${
				(friend_requests as any)?.message
			}\"`,
		)
	} else console.log("Loaded friendship requests list")
	console.log({ friendships, friend_requests })
	return { friendships, friend_requests }
}
