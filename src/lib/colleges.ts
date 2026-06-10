export interface College {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

export const COLLEGES: College[] = [
  {
    id: "st-margaret",
    name: "St Margaret College",
    logo: "/colleges/st-margaret-college.png",
    primaryColor: "#1d4ed8",
    secondaryColor: "#dbeafe",
  },
  {
    id: "maria-regina",
    name: "Maria Regina College",
    logo: "/colleges/maria-regina-college.png",
    primaryColor: "#7c3aed",
    secondaryColor: "#ede9fe",
  },
  {
    id: "st-benedict",
    name: "St Benedict College",
    logo: "/colleges/st-benedict-college.png",
    primaryColor: "#b45309",
    secondaryColor: "#fef3c7",
  },
  {
    id: "st-nicholas",
    name: "St Nicholas College",
    logo: "/colleges/st-nicholas-college.png",
    primaryColor: "#0369a1",
    secondaryColor: "#e0f2fe",
  },
  {
    id: "st-gorg-preca",
    name: "St Ġorġ Preca College",
    logo: "/colleges/st-george-preca-college.png",
    primaryColor: "#be123c",
    secondaryColor: "#ffe4e6",
  },
  {
    id: "st-theresa",
    name: "St Theresa College",
    logo: "/colleges/st-theresa-college.png",
    primaryColor: "#0f766e",
    secondaryColor: "#ccfbf1",
  },
  {
    id: "st-ignatius",
    name: "St Ignatius College",
    logo: "/colleges/st-ignatius-college.png",
    primaryColor: "#4338ca",
    secondaryColor: "#e0e7ff",
  },
  {
    id: "st-thomas-more",
    name: "St Thomas More College",
    logo: "/colleges/st-thomas-more-college.png",
    primaryColor: "#0f766e",
    secondaryColor: "#ccfbf1",
  },
  {
    id: "st-clare",
    name: "St Clare College",
    logo: "/colleges/st-clare-college.png",
    primaryColor: "#15803d",
    secondaryColor: "#dcfce7",
  },
  {
    id: "gozo",
    name: "Gozo College",
    logo: "/colleges/gozo-college.png",
    primaryColor: "#0e7490",
    secondaryColor: "#cffafe",
  },
  {
    id: "mikiel-anton-vassalli",
    name: "Mikiel Anton Vassalli College",
    logo: "/colleges/mikiel-anton-vassalli-college.png",
    primaryColor: "#a16207",
    secondaryColor: "#fef9c3",
  },
  {
    id: "international-learners",
    name: "International Learners'",
    logo: "/colleges/international-learners-directorate.png",
    primaryColor: "#475569",
    secondaryColor: "#f1f5f9",
  },
  {
    id: "giovanni-curmi-hss",
    name: "Giovanni Curmi Higher Secondary",
    logo: "/colleges/giovanni-curmi-higher-secondary.png",
    primaryColor: "#1e40af",
    secondaryColor: "#dbeafe",
  },
];

export function getCollegeById(id: string): College | undefined {
  return COLLEGES.find((c) => c.id === id);
}

export function getCollegeInitials(name: string): string {
  const words = name.replace(/['']/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
