"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
  const [aktivId, setAktivId] = useState<string | null>(null);

  useEffect(() => {
    setAlleProfiler(lager.hentAlle());
    setAktivId(lager.hentAktivId());
    setKlar(true);
  }, [lager]);

  const aktivProfil =
    aktivId === null ? null : alleProfiler.find((p) => p.id === aktivId) ?? null;

  // Synkroniser global lyd-mute med aktiv profil
  useEffect(() => {
    settLydAv(aktivProfil?.lydAv ?? false);
  }, [aktivProfil?.lydAv]);

  function velg(id: string) {
    lager.settAktivId(id);
    setAktivId(id);
  }

  function opprett(navn: string, avatar: string): Profil {
    const ny = lagNyProfil(navn, avatar);
    lager.lagre(ny);
    lager.settAktivId(ny.id);
    setAlleProfiler((prev) => [...prev, ny]);
    setAktivId(ny.id);
    return ny;
  }

  function loggUt() {
    lager.settAktivId(null);
    setAktivId(null);
  }

  function oppdater(fn: ProfilOppdatering) {
    setAlleProfiler((prev) => {
      let oppdatertProfil: Profil | undefined;
      const ny = prev.map((p) => {
        if (p.id !== aktivId) return p;
        oppdatertProfil = fn(p);
        return oppdatertProfil;
      });
      // Persisterer her i stedet for utenfor settere så vi alltid får siste verdi.
      // I React Strict Mode kalles setteren to ganger, så lager.lagre kalles to ganger
      // med samme verdi — idempotent for localStorage, og deduplisering kan legges til
      // i lager-implementasjonen senere hvis nødvendig.
      if (oppdatertProfil) lager.lagre(oppdatertProfil);
      return ny;
    });
  }

  function slett(id: string) {
    lager.slett(id);
    setAlleProfiler((prev) => prev.filter((p) => p.id !== id));
    if (aktivId === id) setAktivId(null);
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
