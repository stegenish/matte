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

  it("oppdater erstatter profilen", () => {
    const lager = lagFakeLager();
    let ctx: ReturnType<typeof useProfil> | undefined;
    render(
      <ProfilProvider lager={lager}>
        <TestForbruker onMount={(c) => (ctx = c)} />
      </ProfilProvider>,
    );
    let opprettet!: ReturnType<typeof useProfil>["opprett"] extends (...a: any) => infer R ? R : never;
    act(() => {
      opprettet = ctx!.opprett("Lily", "🦊");
    });
    act(() => {
      ctx!.oppdater({ ...opprettet, poeng: 42 });
    });
    expect(lager.hent(opprettet.id)?.poeng).toBe(42);
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
