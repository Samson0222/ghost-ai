export interface Project {
  id: string;
  name: string;
  slug: string;
  owned: boolean;
}

export const MOCK_MY_PROJECTS: Project[] = [
  { id: "1", name: "E-commerce Platform", slug: "e-commerce-platform", owned: true },
  { id: "2", name: "Auth Service", slug: "auth-service", owned: true },
  { id: "3", name: "Analytics Dashboard", slug: "analytics-dashboard", owned: true },
];

export const MOCK_SHARED_PROJECTS: Project[] = [
  { id: "4", name: "Design System", slug: "design-system", owned: false },
  { id: "5", name: "API Gateway", slug: "api-gateway", owned: false },
];
