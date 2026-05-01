"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { profilLager } from "@/src/lagring/profilLager";
import { lagNyProfil, type Profil } from "@/src/domene/profil";

interface ProfilContextVerdi {
  aktivProfil: Profil | null;
  alleProfiler: Profil[];
  velg: (id: string) => void;
  opprett: (navn: string, avatar: string) => Profil;
  loggUt: () => void;
  oppdater: (oppdatert: Profil) => void;
  slett: (id: string) => void;
  klar: boolean;
}

const Ctx = createContext<ProfilContextVerdi | undefined>(undefined);

export function ProfilProvider({ children }: { children: ReactNode }) {
  const [klar, setKlar] = useState(false);
  const [alleProfiler, setAlleProfiler] = useState<Profil[]>([]);
  const [aktivId, setAktivId] = useState<string | null>(null);

  useEffect(() => {
    setAlleProfiler(profilLager.hentAlle());
    setAktivId(profilLager.hentAktivId());
    setKlar(true);
  }, []);

  const aktivProfil =
    aktivId === null ? null : alleProfiler.find((p) => p.id === aktivId) ?? null;

  function velg(id: string) {
    profilLager.settAktivId(id);
    setAktivId(id);
  }

  function opprett(navn: string, avatar: string): Profil {
    const ny = lagNyProfil(navn, avatar);
    profilLager.lagre(ny);
    profilLager.settAktivId(ny.id);
    setAlleProfiler((prev) => [...prev, ny]);
    setAktivId(ny.id);
    return ny;
  }

  function loggUt() {
    profilLager.settAktivId(null);
    setAktivId(null);
  }

  function oppdater(oppdatert: Profil) {
    profilLager.lagre(oppdatert);
    setAlleProfiler((prev) =>
      prev.map((p) => (p.id === oppdatert.id ? oppdatert : p)),
    );
  }

  function slett(id: string) {
    profilLager.slett(id);
    setAlleProfiler((prev) => prev.filter((p) => p.id !== id));
    if (aktivId === id) setAktivId(null);
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
