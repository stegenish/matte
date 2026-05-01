/**
 * @jest-environment jsdom
 */
import { act, render, screen } from "@testing-library/react";
import { ProfilProvider, useProfil } from "@/src/komponenter/ProfilProvider";
import { lagFakeLager } from "../fixtures/fakeLager";
import { lagNyProfil } from "@/src/domene/profil";

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

describe("ProfilProvider", () => {
  it("starter med tom liste når lager er tom", () => {
    const lager = lagFakeLager();
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker />
      </ProfilProvider>,
    );
    expect(screen.getByTestId("antall")).toHaveTextContent("0");
    expect(screen.getByTestId("aktiv")).toHaveTextContent("ingen");
  });

  it("opprett legger til profil og setter den aktiv", () => {
    const lager = lagFakeLager();
    let ctx: ReturnType<typeof useProfil> | undefined;
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker onMount={(c) => (ctx = c)} />
      </ProfilProvider>,
    );
    act(() => {
      ctx!.opprett("Lily", "🦊");
    });
    expect(screen.getByTestId("antall")).toHaveTextContent("1");
    expect(screen.getByTestId("aktiv")).toHaveTextContent("Lily");
  });

  it("velg setter aktivProfil", () => {
    const eksisterende = lagNyProfil("Kian", "🐢");
    const lager = lagFakeLager([eksisterende]);
    let ctx: ReturnType<typeof useProfil> | undefined;
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker onMount={(c) => (ctx = c)} />
      </ProfilProvider>,
    );
    expect(screen.getByTestId("aktiv")).toHaveTextContent("ingen");
    act(() => {
      ctx!.velg(eksisterende.id);
    });
    expect(screen.getByTestId("aktiv")).toHaveTextContent("Kian");
  });

  it("loggUt nullstiller aktiv profil", () => {
    const lager = lagFakeLager();
    let ctx: ReturnType<typeof useProfil> | undefined;
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker onMount={(c) => (ctx = c)} />
      </ProfilProvider>,
    );
    act(() => {
      ctx!.opprett("Lily", "🦊");
    });
    act(() => {
      ctx!.loggUt();
    });
    expect(screen.getByTestId("aktiv")).toHaveTextContent("ingen");
    expect(screen.getByTestId("antall")).toHaveTextContent("1");
  });

  it("oppdater anvender funksjonen på aktiv profil", () => {
    const lager = lagFakeLager();
    let ctx: ReturnType<typeof useProfil> | undefined;
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker onMount={(c) => (ctx = c)} />
      </ProfilProvider>,
    );
    let opprettet!: ReturnType<typeof useProfil>["opprett"] extends (...a: never) => infer R ? R : never;
    act(() => {
      opprettet = ctx!.opprett("Lily", "🦊");
    });
    act(() => {
      ctx!.oppdater((p) => ({ ...p, poeng: 42 }));
    });
    expect(lager.hent(opprettet.id)?.poeng).toBe(42);
  });

  it("flere synkron oppdater-kall akkumulerer (ikke stale closure)", () => {
    const lager = lagFakeLager();
    let ctx: ReturnType<typeof useProfil> | undefined;
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker onMount={(c) => (ctx = c)} />
      </ProfilProvider>,
    );
    let id = "";
    act(() => {
      id = ctx!.opprett("Lily", "🦊").id;
    });
    // Fem synkrone oppdater-kall som hver legger til 1 poeng. Med funksjonell
    // oppdater skal alle 5 telle. Stale-closure-bug ville gitt 1 poeng totalt.
    act(() => {
      for (let i = 0; i < 5; i++) {
        ctx!.oppdater((p) => ({ ...p, poeng: p.poeng + 1 }));
      }
    });
    expect(lager.hent(id)?.poeng).toBe(5);
  });

  it("registrerSvar akkumulerer ved batch-kall (ikke stale closure)", () => {
    const lager = lagFakeLager();
    let ctx: ReturnType<typeof useProfil> | undefined;
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker onMount={(c) => (ctx = c)} />
      </ProfilProvider>,
    );
    let id = "";
    act(() => {
      id = ctx!.opprett("Lily", "🦊").id;
    });
    // 5 synkrone svar — alle skal registreres. Tidligere ville stale closure
    // gitt totaltRiktige=1 og kun siste faktaStatus-oppdatering.
    act(() => {
      for (let i = 0; i < 5; i++) {
        ctx!.registrerSvar(`fakta-${i}`, true);
      }
    });
    const lagret = lager.hent(id);
    expect(lagret?.statistikk.totaltRiktige).toBe(5);
    expect(lagret?.faktaStatus).toHaveLength(5);
  });

  it("slett fjerner profilen og nullstiller aktivId hvis den var aktiv", () => {
    const lager = lagFakeLager();
    let ctx: ReturnType<typeof useProfil> | undefined;
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker onMount={(c) => (ctx = c)} />
      </ProfilProvider>,
    );
    let id = "";
    act(() => {
      id = ctx!.opprett("Lily", "🦊").id;
    });
    expect(screen.getByTestId("aktiv")).toHaveTextContent("Lily");
    act(() => {
      ctx!.slett(id);
    });
    expect(screen.getByTestId("antall")).toHaveTextContent("0");
    expect(screen.getByTestId("aktiv")).toHaveTextContent("ingen");
  });
});
