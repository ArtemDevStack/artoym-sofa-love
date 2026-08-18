import { access } from "@/data/relationship";

/**
 * Проверка PIN — сейчас mock на клиенте.
 *
 * Чтобы перевести на server-side: замените тело verifyPin на
 * `fetch("/api/verify", { method: "POST", body: ... })` или Server Action
 * и сравнивайте PIN на сервере. Сигнатура функции и вызовы не изменятся.
 */
export async function verifyPin(candidate: string): Promise<boolean> {
  // Небольшая задержка — как у настоящего запроса; заодно против перебора.
  await new Promise((r) => setTimeout(r, 420));
  return candidate === access.pin;
}
