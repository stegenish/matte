/**
 * @jest-environment jsdom
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import { ProfilProvider, useProfil } from "@/src/komponenter/ProfilProvider";
import { lagFakeLager, type FakeLager } from "../fixtures/fakeLager";
import { lagNyProfil, type Profil } from "@/src/domene/profil";

// Liten test-komponent som leser konteksten og lar oss kalle handlinger derfra
function TestForbruker({ onMount }: { onMount?: (ctx: ReturnType<typeof useProfil>) => void }) {
  const ctx = useProfil();
  if (onMount) onMount(ctx);
  if (!ctx.klar) return <p>laster</p>;
  return (
    <ul>
      <li data-testid="aktiv">{ctx.aktivProfil?.navn ?? "ingen"}</li>
      <li data-testid="antall">{ctx.alleProfiler.length}</li>
    </ul>
  );
}

// Renderer ProfilProvider og venter på at klar=true. Returnerer lager + ctx-ref.
async function renderProfil(seed: Profil[] = []): Promise<{
  lager: FakeLager;
  ctx: ReturnType<typeof useProfil>;
}> {
  const lager = lagFakeLager(seed);
  const ctxRef: { current: ReturnType<typeof useProfil> | undefined } = {
    current: undefined,
  };
  render(
    <ProfilProvider lager={lager}>
      <TestForbruker onMount={(c) => (ctxRef.current = c)} />
    </ProfilProvider>,
  );
  await waitFor(() => {
    expect(screen.queryByText("laster")).not.toBeInTheDocument();
  });
  return { lager, ctx: ctxRef.current! };
}

describe("ProfilProvider", () => {
  it("starter med tom liste når lager er tom", async () => {
    await renderProfil();
    expect(screen.getByTestId("antall")).toHaveTextContent("0");
    expect(screen.getByTestId("aktiv")).toHaveTextContent("ingen");
  });

  it("opprett legger til profil og setter den aktiv", async () => {
    const { ctx } = await renderProfil();
    act(() => {
      ctx.opprett("Lily", "🦊");
    });
    expect(screen.getByTestId("antall")).toHaveTextContent("1");
    expect(screen.getByTestId("aktiv")).toHaveTextContent("Lily");
  });

  it("velg setter aktivProfil", async () => {
    const eksisterende = lagNyProfil("Kian", "🐢");
    const { ctx } = await renderProfil([eksisterende]);
    expect(screen.getByTestId("aktiv")).toHaveTextContent("ingen");
    act(() => {
      ctx.velg(eksisterende.id);
    });
    expect(screen.getByTestId("aktiv")).toHaveTextContent("Kian");
  });

  it("loggUt nullstiller aktiv profil", async () => {
    const { ctx } = await renderProfil();
    act(() => {
      ctx.opprett("Lily", "🦊");
    });
    act(() => {
      ctx.loggUt();
    });
    expect(screen.getByTestId("aktiv")).toHaveTextContent("ingen");
    expect(screen.getByTestId("antall")).toHaveTextContent("1");
  });

  it("oppdater anvender funksjonen på aktiv profil", async () => {
    const { lager, ctx } = await renderProfil();
    let opprettet: Profil | undefined;
    act(() => {
      opprettet = ctx.opprett("Lily", "🦊");
    });
    act(() => {
      ctx.oppdater((p) => ({ ...p, poeng: 42 }));
    });
    expect(lager.hentSync(opprettet!.id)?.poeng).toBe(42);
  });

  it("flere synkron oppdater-kall akkumulerer (ikke stale closure)", async () => {
    const { lager, ctx } = await renderProfil();
    let id = "";
    act(() => {
      id = ctx.opprett("Lily", "🦊").id;
    });
    // Fem synkrone oppdater-kall som hver legger til 1 poeng. Med funksjonell
    // oppdater skal alle 5 telle. Stale-closure-bug ville gitt 1 poeng totalt.
    act(() => {
      for (let i = 0; i < 5; i++) {
        ctx.oppdater((p) => ({ ...p, poeng: p.poeng + 1 }));
      }
    });
    expect(lager.hentSync(id)?.poeng).toBe(5);
  });

  it("registrerSvar akkumulerer ved batch-kall (ikke stale closure)", async () => {
    const { lager, ctx } = await renderProfil();
    let id = "";
    act(() => {
      id = ctx.opprett("Lily", "🦊").id;
    });
    // 5 synkrone svar — alle skal registreres. Tidligere ville stale closure
    // gitt totaltRiktige=1 og kun siste faktaStatus-oppdatering.
    act(() => {
      for (let i = 0; i < 5; i++) {
        ctx.registrerSvar(`fakta-${i}`, true);
      }
    });
    const lagret = lager.hentSync(id);
    expect(lagret?.statistikk.totaltRiktige).toBe(5);
    expect(lagret?.faktaStatus).toHaveLength(5);
  });

  it("slett fjerner profilen og nullstiller aktivId hvis den var aktiv", async () => {
    const { ctx } = await renderProfil();
    let id = "";
    act(() => {
      id = ctx.opprett("Lily", "🦊").id;
    });
    expect(screen.getByTestId("aktiv")).toHaveTextContent("Lily");
    act(() => {
      ctx.slett(id);
    });
    expect(screen.getByTestId("antall")).toHaveTextContent("0");
    expect(screen.getByTestId("aktiv")).toHaveTextContent("ingen");
  });
});
