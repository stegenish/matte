"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { profilLager as standardLager } from "@/src/lagring/profilLager";
import type { ProfilLager } from "@/src/lagring/profilLager";
import { lagNyProfil, type Profil } from "@/src/domene/profil";
import { oppdaterFaktaStatus } from "@/src/domene/faktaStatus";
import { settLydAv, spillFeil, spillRett } from "@/src/lyd";

interface ProfilContextVerdi {
  aktivProfil: Profil | null;
  alleProfiler: Profil[];
  velg: (id: string) => void;
  opprett: (navn: string, avatar: string) => Profil;
  loggUt: () => void;
  oppdater: (oppdatert: Profil) => void;
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

  function oppdater(oppdatert: Profil) {
    lager.lagre(oppdatert);
    setAlleProfiler((prev) =>
      prev.map((p) => (p.id === oppdatert.id ? oppdatert : p)),
    );
  }

  function slett(id: string) {
    lager.slett(id);
    setAlleProfiler((prev) => prev.filter((p) => p.id !== id));
    if (aktivId === id) setAktivId(null);
  }

  function registrerSvar(oppgaveNøkkel: string | null, riktig: boolean) {
    if (!aktivProfil) return;
    if (riktig) spillRett();
    else spillFeil();
    const oppdatertFakta = oppgaveNøkkel
      ? oppdaterFaktaStatus(aktivProfil.faktaStatus, oppgaveNøkkel, riktig)
      : aktivProfil.faktaStatus;
    const oppdatertProfil: Profil = {
      ...aktivProfil,
      faktaStatus: oppdatertFakta,
      statistikk: {
        ...aktivProfil.statistikk,
        totaltRiktige: aktivProfil.statistikk.totaltRiktige + (riktig ? 1 : 0),
        totaltFeil: aktivProfil.statistikk.totaltFeil + (riktig ? 0 : 1),
      },
    };
    oppdater(oppdatertProfil);
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
