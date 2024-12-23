import type { Services } from "../service/services.ts";

export function listen(services: Services, { port } = { port: 6699 }) {
  Deno.serve({ port }, (req, info) => {
    switch (req.url) {
      default:
        return new Response(JSON.stringify([...services.list.values()]), {
          headers: {
            "content-type": "application/json",
          },
          statusText: "OK",
          status: 200,
        });
    }
  });
}
