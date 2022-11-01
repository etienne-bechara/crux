export interface DocSpecification {
  openapi: string;
  paths: Record<string, any>;
  info: Record<string, any>;
  tags: string[];
  servers: string[];
  components: Record<string, any>;
}
