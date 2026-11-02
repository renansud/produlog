import { operationA, operationB, supervisorB } from "./scoped-productivity";

// Oráculo transcrito das contagens documentadas; não usa funções de cálculo do produto.
export const chartParityCases = [
  { name: "conjunto completo", query: "", monthly: [42.86, 37.5], supervisors: [50, 28.57], teams: ["Equipe Exemplo A", "Equipe Exemplo B"], evolution: -5.36, total: "1500.00" },
  { name: "junho", query: "months=2026-06", monthly: [42.86, 37.5], supervisors: [50, 33.33], teams: ["Equipe Exemplo A", "Equipe Exemplo B"], evolution: -5.36, total: "700.00" },
  { name: "julho", query: "months=2026-07", monthly: [42.86, 37.5], supervisors: [50, 25], teams: ["Equipe Exemplo A", "Equipe Exemplo B"], evolution: -5.36, total: "800.00" },
  { name: "operação A", query: `operations=${operationA}`, monthly: [50, 50], supervisors: [50], teams: ["Equipe Exemplo A"], evolution: 0, total: "800.00" },
  { name: "operação B", query: `operations=${operationB}`, monthly: [33.33, 25], supervisors: [28.57], teams: ["Equipe Exemplo B"], evolution: -8.33, total: "700.00" },
  { name: "julho e supervisor B", query: `months=2026-07&operations=${operationB}&supervisors=${supervisorB}`, monthly: [33.33, 25], supervisors: [25], teams: ["Equipe Exemplo B"], evolution: -8.33, total: "400.00" },
  { name: "mês sem registros", query: "months=2027-01", monthly: [42.86, 37.5], supervisors: [], teams: [], evolution: -5.36, total: "0.00" },
];
