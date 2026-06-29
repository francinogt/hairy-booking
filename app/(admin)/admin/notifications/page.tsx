import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { listNotificationsForUser } from "@/data/notifications";
import { markAllReadAction, markNotificationReadAction } from "@/app/actions/notifications";
import { PushToggle } from "@/components/push-toggle";

export const metadata: Metadata = { title: "Benachrichtigungen" };

export default async function NotificationsPage() {
  const user = await requireRole("owner", "admin");
  const items = await listNotificationsForUser(user.id);
  const hasUnread = items.some((n) => !n.readAt);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-zinc-900">Benachrichtigungen</h1>
        {hasUnread ? (
          <form action={markAllReadAction}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Alle als gelesen
            </button>
          </form>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-medium text-zinc-900">Push auf dieses Gerät</p>
        <p className="mt-0.5 mb-3 text-sm text-zinc-500">
          Erhalte neue Anfragen sofort als Benachrichtigung — auch wenn die App geschlossen ist.
        </p>
        <PushToggle />
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Keine Benachrichtigungen.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex items-start justify-between gap-3 rounded-xl border p-4 ${
                n.readAt ? "border-zinc-200 bg-white" : "border-accent/30 bg-accent/5"
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">
                  {n.link ? (
                    <Link href={n.link} className="hover:underline">
                      {n.title}
                    </Link>
                  ) : (
                    n.title
                  )}
                </p>
                {n.body ? <p className="mt-0.5 text-sm text-zinc-600">{n.body}</p> : null}
                <p className="mt-1 text-xs text-zinc-400">{n.createdAt.slice(0, 16)}</p>
              </div>
              {!n.readAt ? (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="notificationId" value={n.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                  >
                    gelesen
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
