import { RelationshipField } from "@payloadcms/ui";
import type { RelationshipFieldServerComponent } from "payload";
import { isAdmin } from "@/cms/access";

/**
 * The Site field of a document. Administrators can move a document to another
 * site; editors don't see the field — its value (their workspace by default)
 * stays in the form and is saved like any other.
 */
export const SiteField: RelationshipFieldServerComponent = ({ clientField, path, schemaPath, permissions, readOnly, user }) =>
  isAdmin(user) ? (
    <RelationshipField field={clientField} path={path} schemaPath={schemaPath} permissions={permissions} readOnly={readOnly} />
  ) : null;
