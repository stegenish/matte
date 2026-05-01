"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { profilLager as standardLager } from "@/src/lagring/profilLager";
import type { ProfilLager } from "@/src/lagring/profilLager";
import { lagNyProfil, type Profil } from "@/src/domene/profil";
import { oppdaterFaktaStatus } from "@/src/domene/faktaStatus";
import { settLydAv, spillFeil, spillRett } from "@/src/lyd";

// Funksjonell oppdater: tar en funksjon som beregner ny profil fra forrige.
// Dette unngår stale-closure-bugs ved batch-oppdateringer (f.eks. når
// "Sjekk svar" registrerer 5 svar synkront — hver kall ser sist oppdaterte
// profil i stedet for closure-fanget gammel verdi).
export type ProfilOppdatering = (forrige: Profil) => Profil;

interface ProfilContextVerdi {
  aktivProfil: Profil | null;
  alleProfiler: Profil[];
  velg: (id: string) => void;
  opprett: (navn: string, avatar: string) => Profil;
  loggUt: () => void;
  oppdater: (fn: ProfilOppdatering) => void;
  slett: (id: string) => void;
  // Registrerer ett oppgave-svar: oppdaterer faktaStatus + statistikk på aktiv profil.
  registrerSvar: (oppgaveNøkkel: string | null, riktig: boolean) => void;
  klar: boolean;
}

const Ctx = createContext<ProfilContextVerdi | undefined>(undefined);

interface Props {
  children: ReactNode;
  // Lager kan injiseres for testing eller for å bytte til API-backend senere.
  // Default = localStorage-basert lager.
  lager?: ProfilLager;
}

export function ProfilProvider({ children, lager = standardLager }: Props) {
  const [klar, setKlar] = useState(false);
  const [alleProfiler, setAlleProfiler] = useState<Profil[]>([]);
  const [aktivId, setAktivIdState] = useState<string | null>(null);
  // Ref holder synkronisert aktivId-verdi. Brukes inni setAlleProfiler-callbacks
  // som ellers ville sett stale closure-verdi når flere oppdateringer kommer
  // tett etter hverandre (f.eks. opprett+oppdater i samme act-blokk i tester).
  const aktivIdRef = useRef<string | null>(null);

  function setAktivId(id: string | null) {
    aktivIdRef.current = id;
    setAktivIdState(id);
  }

  useEffect(() => {
    let avbrutt = false;
    Promise.all([lager.hentAlle(), lager.hentAktivId()])
      .then(([profiler, lastetAktivId]) => {
        if (avbrutt) return;
        setAlleProfiler(profiler);
        setAktivId(lastetAktivId);
        setKlar(true);
      })
      .catch((err) => {
        console.error("Kunne ikke laste profiler:", err);
        if (!avbrutt) setKlar(true);
      });
    return () => {
      avbrutt = true;
    };
  }, [lager]);

  const aktivProfil =
    aktivId === null ? null : alleProfiler.find((p) => p.id === aktivId) ?? null;

  // Synkroniser global lyd-mute med aktiv profil
  useEffect(() => {
    settLydAv(aktivProfil?.lydAv ?? false);
  }, [aktivProfil?.lydAv]);

  // Fire-and-forget lager-skriving. Logger feil men blokkerer ikke UI.
  function persisterStille(løfte: Promise<unknown>, kontekst: string): void {
    løfte.catch((err) => console.error(`Lagring feilet (${kontekst}):`, err));
  }

  function velg(id: string) {
    persisterStille(lager.settAktivId(id), "velg");
    setAktivId(id);
  }

  function opprett(navn: string, avatar: string): Profil {
    const ny = lagNyProfil(navn, avatar);
    persisterStille(lager.lagre(ny), "opprett.lagre");
    persisterStille(lager.settAktivId(ny.id), "opprett.settAktiv");
    setAlleProfiler((prev) => [...prev, ny]);
    setAktivId(ny.id);
    return ny;
  }

  function loggUt() {
    persisterStille(lager.settAktivId(null), "loggUt");
    setAktivId(null);
  }

  function oppdater(fn: ProfilOppdatering) {
    const id = aktivIdRef.current;
    if (!id) return;
    setAlleProfiler((prev) => {
      let oppdatertProfil: Profil | undefined;
      const ny = prev.map((p) => {
        if (p.id !== id) return p;
        oppdatertProfil = fn(p);
        return oppdatertProfil;
      });
      // Persisterer her i stedet for utenfor settere så vi alltid får siste verdi.
      // I React Strict Mode kalles setteren to ganger, så lager.lagre kalles to ganger
      // med samme verdi — idempotent for localStorage. Deduplisering kan legges til
      // i lager-implementasjonen senere hvis det blir et problem mot Supabase.
      if (oppdatertProfil) persisterStille(lager.lagre(oppdatertProfil), "oppdater");
      return ny;
    });
  }

  function slett(id: string) {
    persisterStille(lager.slett(id), "slett");
    setAlleProfiler((prev) => prev.filter((p) => p.id !== id));
    if (aktivIdRef.current === id) setAktivId(null);
  }

  function registrerSvar(oppgaveNøkkel: string | null, riktig: boolean) {
    if (riktig) spillRett();
    else spillFeil();
    oppdater((forrige) => ({
      ...forrige,
      faktaStatus: oppgaveNøkkel
        ? oppdaterFaktaStatus(forrige.faktaStatus, oppgaveNøkkel, riktig)
        : forrige.faktaStatus,
      statistikk: {
        ...forrige.statistikk,
        totaltRiktige: forrige.statistikk.totaltRiktige + (riktig ? 1 : 0),
        totaltFeil: forrige.statistikk.totaltFeil + (riktig ? 0 : 1),
      },
    }));
  }

  return (
    <Ctx.Provider
      value={{
        aktivProfil,
        alleProfiler,
        velg,
        opprett,
        loggUt,
        oppdater,
        slett,
        registrerSvar,
        klar,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useProfil(): ProfilContextVerdi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfil må brukes inni en ProfilProvider");
  return ctx;
}
