// GENERATED by @gel/generate v0.6.2

import type * as gel from "gel";
export namespace std {
  export interface BaseObject {
    "id": string;
  }
  export interface $Object extends BaseObject {}
  export type Endian = "Little" | "Big";
  export interface FreeObject {}
  export type JsonEmpty = "ReturnEmpty" | "ReturnTarget" | "Error" | "UseNull" | "DeleteKey";
  export namespace enc {
    export type Base64Alphabet = "standard" | "urlsafe";
  }
  export namespace fts {
    export type ElasticLanguage = "ara" | "bul" | "cat" | "ces" | "ckb" | "dan" | "deu" | "ell" | "eng" | "eus" | "fas" | "fin" | "fra" | "gle" | "glg" | "hin" | "hun" | "hye" | "ind" | "ita" | "lav" | "nld" | "nor" | "por" | "ron" | "rus" | "spa" | "swe" | "tha" | "tur" | "zho" | "edb_Brazilian" | "edb_ChineseJapaneseKorean";
    export type Language = "ara" | "hye" | "eus" | "cat" | "dan" | "nld" | "eng" | "fin" | "fra" | "deu" | "ell" | "hin" | "hun" | "ind" | "gle" | "ita" | "nor" | "por" | "ron" | "rus" | "spa" | "swe" | "tur";
    export type LuceneLanguage = "ara" | "ben" | "bul" | "cat" | "ces" | "ckb" | "dan" | "deu" | "ell" | "eng" | "est" | "eus" | "fas" | "fin" | "fra" | "gle" | "glg" | "hin" | "hun" | "hye" | "ind" | "ita" | "lav" | "lit" | "nld" | "nor" | "por" | "ron" | "rus" | "spa" | "srp" | "swe" | "tha" | "tur" | "edb_Brazilian" | "edb_ChineseJapaneseKorean" | "edb_Indian";
    export type PGLanguage = "xxx_simple" | "ara" | "hye" | "eus" | "cat" | "dan" | "nld" | "eng" | "fin" | "fra" | "deu" | "ell" | "hin" | "hun" | "ind" | "gle" | "ita" | "lit" | "npi" | "nor" | "por" | "ron" | "rus" | "srp" | "spa" | "swe" | "tam" | "tur" | "yid";
    export type Weight = "A" | "B" | "C" | "D";
  }
  export namespace net {
    export type RequestFailureKind = "NetworkError" | "Timeout";
    export type RequestState = "Pending" | "InProgress" | "Completed" | "Failed";
    export namespace http {
      export type Method = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
      export interface Response extends std.BaseObject {
        "created_at": Date;
        "status"?: number | null;
        "headers"?: {name: string, value: string}[] | null;
        "body"?: Uint8Array | null;
        "request"?: ScheduledRequest | null;
      }
      export interface ScheduledRequest extends std.BaseObject {
        "state": std.net.RequestState;
        "created_at": Date;
        "updated_at": Date;
        "failure"?: {kind: std.net.RequestFailureKind, message: string} | null;
        "url": string;
        "method": Method;
        "headers"?: {name: string, value: string}[] | null;
        "body"?: Uint8Array | null;
        "response"?: Response | null;
      }
    }
  }
}
export namespace cfg {
  export interface ConfigObject extends std.BaseObject {}
  export interface AbstractConfig extends ConfigObject {
    "default_transaction_access_mode": sys.TransactionAccessMode;
    "session_idle_timeout": gel.Duration;
    "default_transaction_isolation": sys.TransactionIsolation;
    "default_transaction_deferrable": sys.TransactionDeferrability;
    "session_idle_transaction_timeout": gel.Duration;
    "query_execution_timeout": gel.Duration;
    "listen_port": number;
    "listen_addresses": string[];
    "current_email_provider_name"?: string | null;
    "allow_dml_in_functions"?: boolean | null;
    "allow_bare_ddl"?: AllowBareDDL | null;
    "store_migration_sdl"?: StoreMigrationSDL | null;
    "apply_access_policies"?: boolean | null;
    "apply_access_policies_pg"?: boolean | null;
    "allow_user_specified_id"?: boolean | null;
    "simple_scoping"?: boolean | null;
    "warn_old_scoping"?: boolean | null;
    "cors_allow_origins": string[];
    "auto_rebuild_query_cache"?: boolean | null;
    "auto_rebuild_query_cache_timeout"?: gel.Duration | null;
    "query_cache_mode"?: QueryCacheMode | null;
    "http_max_connections"?: number | null;
    "shared_buffers"?: gel.ConfigMemory | null;
    "query_work_mem"?: gel.ConfigMemory | null;
    "maintenance_work_mem"?: gel.ConfigMemory | null;
    "effective_cache_size"?: gel.ConfigMemory | null;
    "effective_io_concurrency"?: number | null;
    "default_statistics_target"?: number | null;
    "force_database_error"?: string | null;
    "_pg_prepared_statement_cache_size": number;
    "track_query_stats"?: QueryStatsOption | null;
    "extensions": ExtensionConfig[];
    "auth": Auth[];
    "email_providers": EmailProviderConfig[];
  }
  export type AllowBareDDL = "AlwaysAllow" | "NeverAllow";
  export interface Auth extends ConfigObject {
    "priority": number;
    "user": string[];
    "comment"?: string | null;
    "method"?: AuthMethod | null;
  }
  export interface AuthMethod extends ConfigObject {
    "transports": ConnectionTransport[];
  }
  export interface DatabaseConfig extends AbstractConfig {}
  export interface BranchConfig extends DatabaseConfig {}
  export interface Config extends AbstractConfig {}
  export type ConnectionTransport = "TCP" | "TCP_PG" | "HTTP" | "SIMPLE_HTTP" | "HTTP_METRICS" | "HTTP_HEALTH";
  export interface EmailProviderConfig extends ConfigObject {
    "name": string;
  }
  export interface ExtensionConfig extends ConfigObject {
    "cfg": AbstractConfig;
  }
  export interface InstanceConfig extends AbstractConfig {}
  export interface JWT extends AuthMethod {
    "transports": ConnectionTransport[];
  }
  export interface Password extends AuthMethod {
    "transports": ConnectionTransport[];
  }
  export type QueryCacheMode = "InMemory" | "RegInline" | "PgFunc" | "Default";
  export type QueryStatsOption = "None" | "All";
  export interface SCRAM extends AuthMethod {
    "transports": ConnectionTransport[];
  }
  export interface SMTPProviderConfig extends EmailProviderConfig {
    "sender"?: string | null;
    "host"?: string | null;
    "port"?: number | null;
    "username"?: string | null;
    "password"?: string | null;
    "security": SMTPSecurity;
    "validate_certs": boolean;
    "timeout_per_email": gel.Duration;
    "timeout_per_attempt": gel.Duration;
  }
  export type SMTPSecurity = "PlainText" | "TLS" | "STARTTLS" | "STARTTLSOrPlainText";
  export type StoreMigrationSDL = "AlwaysStore" | "NeverStore";
  export interface Trust extends AuthMethod {}
  export interface mTLS extends AuthMethod {
    "transports": ConnectionTransport[];
  }
}
export namespace sys {
  export interface SystemObject extends schema.$Object {}
  export interface ExternalObject extends SystemObject {}
  export interface Branch extends ExternalObject, schema.AnnotationSubject {
    "name": string;
    "last_migration"?: string | null;
  }
  export interface Database extends Branch {}
  export interface ExtensionPackage extends SystemObject, schema.AnnotationSubject {
    "script": string;
    "version": {major: number, minor: number, stage: VersionStage, stage_no: number, local: string[]};
  }
  export interface ExtensionPackageMigration extends SystemObject, schema.AnnotationSubject {
    "script": string;
    "from_version": {major: number, minor: number, stage: VersionStage, stage_no: number, local: string[]};
    "to_version": {major: number, minor: number, stage: VersionStage, stage_no: number, local: string[]};
  }
  export type OutputFormat = "BINARY" | "JSON" | "JSON_ELEMENTS" | "NONE";
  export interface QueryStats extends ExternalObject {
    "query"?: string | null;
    "query_type"?: QueryType | null;
    "tag"?: string | null;
    "compilation_config"?: unknown | null;
    "protocol_version"?: {major: number, minor: number} | null;
    "default_namespace"?: string | null;
    "namespace_aliases"?: unknown | null;
    "output_format"?: OutputFormat | null;
    "expect_one"?: boolean | null;
    "implicit_limit"?: number | null;
    "inline_typeids"?: boolean | null;
    "inline_typenames"?: boolean | null;
    "inline_objectids"?: boolean | null;
    "plans"?: number | null;
    "total_plan_time"?: gel.Duration | null;
    "min_plan_time"?: gel.Duration | null;
    "max_plan_time"?: gel.Duration | null;
    "mean_plan_time"?: gel.Duration | null;
    "stddev_plan_time"?: gel.Duration | null;
    "calls"?: number | null;
    "total_exec_time"?: gel.Duration | null;
    "min_exec_time"?: gel.Duration | null;
    "max_exec_time"?: gel.Duration | null;
    "mean_exec_time"?: gel.Duration | null;
    "stddev_exec_time"?: gel.Duration | null;
    "rows"?: number | null;
    "stats_since"?: Date | null;
    "minmax_stats_since"?: Date | null;
    "branch"?: Branch | null;
  }
  export type QueryType = "EdgeQL" | "SQL";
  export interface Role extends SystemObject, schema.InheritingObject, schema.AnnotationSubject {
    "name": string;
    "superuser": boolean;
    "is_superuser": boolean;
    "password"?: string | null;
    "member_of": Role[];
  }
  export type TransactionAccessMode = "ReadOnly" | "ReadWrite";
  export type TransactionDeferrability = "Deferrable" | "NotDeferrable";
  export type TransactionIsolation = "RepeatableRead" | "Serializable";
  export type VersionStage = "dev" | "alpha" | "beta" | "rc" | "final";
}
export namespace coreforce {
  export interface CartItem extends std.$Object {
    "cartId": number;
    "cartItemId": number;
    "description": string;
    "imageUrl": string;
    "listPrice": number;
    "productId": number;
    "quantity": number;
    "smallImageUrl": string;
    "timeSubmitted": Date;
    "unitPrice": number;
    "contact": Contact;
  }
  export interface Contact extends std.$Object {
    "email": string;
    "cfContactId": number;
    "fullName": string;
    "unsubscribed": boolean;
    "items": CartItem[];
    "activeTask"?: EmailTask | null;
    "steps": EmailTaskStep[];
  }
  export interface EmailTask extends std.$Object {
    "origination": Date;
    "sequence": number;
    "contact": Contact;
  }
  export interface EmailTaskStep extends std.$Object {
    "message": string;
    "sequence": number;
    "success": boolean;
    "time": Date;
    "contact": Contact;
  }
}
export namespace $default {
  export interface Account extends std.$Object {
    "provider": string;
    "providerAccountId": string;
    "access_token"?: string | null;
    "createdAt"?: Date | null;
    "expires_at"?: number | null;
    "id_token"?: string | null;
    "refresh_token"?: string | null;
    "scope"?: string | null;
    "session_state"?: string | null;
    "token_type"?: string | null;
    "type": string;
    "userId": string;
    "user": User;
  }
  export interface InngestError extends std.$Object {
    "acknowledged"?: boolean | null;
    "errorName": string;
    "functionId": string;
    "message": string;
    "runId": string;
    "timestamp"?: Date | null;
  }
  export interface Session extends std.$Object {
    "userId": string;
    "createdAt"?: Date | null;
    "expires": Date;
    "sessionToken": string;
    "user": User;
  }
  export interface User extends std.$Object {
    "createdAt"?: Date | null;
    "email": string;
    "emailVerified"?: Date | null;
    "image"?: string | null;
    "name"?: string | null;
    "accounts": Account[];
    "sessions": Session[];
  }
  export interface UserPermission extends std.$Object {
    "verified": boolean;
    "user": User;
  }
  export interface VerificationToken extends std.$Object {
    "identifier": string;
    "token": string;
    "createdAt"?: Date | null;
    "expires": Date;
  }
}
export type Account = $default.Account;
export type InngestError = $default.InngestError;
export type Session = $default.Session;
export type User = $default.User;
export type UserPermission = $default.UserPermission;
export type VerificationToken = $default.VerificationToken;
export namespace ecommerce {
  export interface Category extends std.$Object {
    "cfId": number;
    "code": string;
    "description": string;
    "department": Department[];
  }
  export interface Department extends std.$Object {
    "cfId": number;
    "code": string;
    "description": string;
    "categories": Category[];
  }
  export interface Location extends std.$Object {
    "cfId": number;
    "code": string;
    "description": string;
    "inactive": boolean;
    "internalUse": boolean;
  }
  export interface Manufacturer extends std.$Object {
    "cfId": number;
    "code": string;
    "description": string;
    "detailedDescription"?: string | null;
    "imageId"?: number | null;
    "inactive": boolean;
    "metaDescription"?: string | null;
  }
  export interface Product extends std.$Object {
    "productCategoryIds": number[];
    "productManufacturerId"?: number | null;
    "productTagIds": number[];
    "baseCost"?: number | null;
    "cfId": number;
    "code": string;
    "dateCreated": Date;
    "description": string;
    "detailedDescription"?: string | null;
    "imageId"?: number | null;
    "imageUrls": string[];
    "linkName"?: string | null;
    "listPrice"?: number | null;
    "manufacturerAdvertisedPrice"?: number | null;
    "manufacturerImageId"?: number | null;
    "manufacturerSku"?: string | null;
    "model"?: string | null;
    "sortOrder": number;
    "timeChanged": Date;
    "upcCode"?: string | null;
    "productCategories": Category[];
    "productManufacturer"?: Manufacturer | null;
    "productTags": Tag[];
  }
  export interface Tag extends std.$Object {
    "cfId": number;
    "code": string;
    "description": string;
    "detailedDescription"?: string | null;
    "inactive": boolean;
    "metaDescription"?: string | null;
  }
}
export namespace schema {
  export type AccessKind = "Select" | "UpdateRead" | "UpdateWrite" | "Delete" | "Insert";
  export interface $Object extends std.BaseObject {
    "name": string;
    "internal": boolean;
    "builtin": boolean;
    "computed_fields"?: string[] | null;
  }
  export interface SubclassableObject extends $Object {
    "abstract"?: boolean | null;
    "is_abstract"?: boolean | null;
    "final": boolean;
    "is_final": boolean;
  }
  export interface InheritingObject extends SubclassableObject {
    "inherited_fields"?: string[] | null;
    "bases": InheritingObject[];
    "ancestors": InheritingObject[];
  }
  export interface AnnotationSubject extends $Object {
    "annotations": Annotation[];
  }
  export interface AccessPolicy extends InheritingObject, AnnotationSubject {
    "access_kinds": AccessKind[];
    "condition"?: string | null;
    "action": AccessPolicyAction;
    "expr"?: string | null;
    "errmessage"?: string | null;
    "subject": ObjectType;
  }
  export type AccessPolicyAction = "Allow" | "Deny";
  export interface Alias extends AnnotationSubject {
    "expr": string;
    "type"?: Type | null;
  }
  export interface Annotation extends InheritingObject, AnnotationSubject {
    "inheritable"?: boolean | null;
  }
  export interface Type extends SubclassableObject, AnnotationSubject {
    "expr"?: string | null;
    "from_alias"?: boolean | null;
    "is_from_alias"?: boolean | null;
  }
  export interface PrimitiveType extends Type {}
  export interface CollectionType extends PrimitiveType {}
  export interface Array extends CollectionType {
    "dimensions"?: number[] | null;
    "element_type": Type;
  }
  export interface ArrayExprAlias extends Array {}
  export interface CallableObject extends AnnotationSubject {
    "return_typemod"?: TypeModifier | null;
    "params": Parameter[];
    "return_type"?: Type | null;
  }
  export type Cardinality = "One" | "Many";
  export interface VolatilitySubject extends $Object {
    "volatility"?: Volatility | null;
  }
  export interface Cast extends AnnotationSubject, VolatilitySubject {
    "allow_implicit"?: boolean | null;
    "allow_assignment"?: boolean | null;
    "from_type"?: Type | null;
    "to_type"?: Type | null;
  }
  export interface ConsistencySubject extends InheritingObject, AnnotationSubject {
    "constraints": Constraint[];
  }
  export interface Constraint extends CallableObject, InheritingObject {
    "expr"?: string | null;
    "subjectexpr"?: string | null;
    "finalexpr"?: string | null;
    "errmessage"?: string | null;
    "delegated"?: boolean | null;
    "except_expr"?: string | null;
    "subject"?: ConsistencySubject | null;
    "params": Parameter[];
  }
  export interface Delta extends $Object {
    "parents": Delta[];
  }
  export interface Extension extends AnnotationSubject, $Object {
    "package": sys.ExtensionPackage;
  }
  export interface Function extends CallableObject, VolatilitySubject {
    "preserves_optionality"?: boolean | null;
    "body"?: string | null;
    "language": string;
    "used_globals": Global[];
  }
  export interface FutureBehavior extends $Object {}
  export interface Global extends AnnotationSubject {
    "default"?: string | null;
    "required"?: boolean | null;
    "cardinality"?: Cardinality | null;
    "expr"?: string | null;
    "target"?: Type | null;
  }
  export interface Index extends InheritingObject, AnnotationSubject {
    "expr"?: string | null;
    "except_expr"?: string | null;
    "deferrability"?: IndexDeferrability | null;
    "deferred"?: boolean | null;
    "kwargs"?: {name: string, expr: string}[] | null;
    "params": Parameter[];
  }
  export type IndexDeferrability = "Prohibited" | "Permitted" | "Required";
  export interface Pointer extends ConsistencySubject, AnnotationSubject {
    "cardinality"?: Cardinality | null;
    "required"?: boolean | null;
    "readonly"?: boolean | null;
    "default"?: string | null;
    "expr"?: string | null;
    "secret"?: boolean | null;
    "source"?: Source | null;
    "target"?: Type | null;
    "rewrites": Rewrite[];
  }
  export interface Source extends $Object {
    "pointers": Pointer[];
    "indexes": Index[];
  }
  export interface Link extends Pointer, Source {
    "on_target_delete"?: TargetDeleteAction | null;
    "on_source_delete"?: SourceDeleteAction | null;
    "target"?: ObjectType | null;
    "properties": Property[];
  }
  export interface Migration extends AnnotationSubject, $Object {
    "script": string;
    "sdl"?: string | null;
    "message"?: string | null;
    "generated_by"?: MigrationGeneratedBy | null;
    "parents": Migration[];
  }
  export type MigrationGeneratedBy = "DevMode" | "DDLStatement";
  export interface Module extends AnnotationSubject, $Object {}
  export interface MultiRange extends CollectionType {
    "element_type": Type;
  }
  export interface MultiRangeExprAlias extends MultiRange {}
  export interface ObjectType extends Source, ConsistencySubject, InheritingObject, Type, AnnotationSubject {
    "compound_type": boolean;
    "is_compound_type": boolean;
    "union_of": ObjectType[];
    "intersection_of": ObjectType[];
    "links": Link[];
    "properties": Property[];
    "access_policies": AccessPolicy[];
    "triggers": Trigger[];
  }
  export interface Operator extends CallableObject, VolatilitySubject {
    "operator_kind"?: OperatorKind | null;
    "is_abstract"?: boolean | null;
    "abstract"?: boolean | null;
  }
  export type OperatorKind = "Infix" | "Postfix" | "Prefix" | "Ternary";
  export interface Parameter extends $Object {
    "typemod": TypeModifier;
    "kind": ParameterKind;
    "num": number;
    "default"?: string | null;
    "type": Type;
  }
  export type ParameterKind = "VariadicParam" | "NamedOnlyParam" | "PositionalParam";
  export interface Property extends Pointer {}
  export interface PseudoType extends InheritingObject, Type {}
  export interface Range extends CollectionType {
    "element_type": Type;
  }
  export interface RangeExprAlias extends Range {}
  export interface Rewrite extends InheritingObject, AnnotationSubject {
    "kind": TriggerKind;
    "expr": string;
    "subject": Pointer;
  }
  export type RewriteKind = "Update" | "Insert";
  export interface ScalarType extends PrimitiveType, ConsistencySubject, AnnotationSubject {
    "default"?: string | null;
    "enum_values"?: string[] | null;
    "arg_values"?: string[] | null;
  }
  export type SourceDeleteAction = "DeleteTarget" | "Allow" | "DeleteTargetIfOrphan";
  export type TargetDeleteAction = "Restrict" | "DeleteSource" | "Allow" | "DeferredRestrict";
  export interface Trigger extends InheritingObject, AnnotationSubject {
    "timing": TriggerTiming;
    "kinds": TriggerKind[];
    "scope": TriggerScope;
    "expr"?: string | null;
    "condition"?: string | null;
    "subject": ObjectType;
  }
  export type TriggerKind = "Update" | "Delete" | "Insert";
  export type TriggerScope = "All" | "Each";
  export type TriggerTiming = "After" | "AfterCommitOf";
  export interface Tuple extends CollectionType {
    "named": boolean;
    "element_types": TupleElement[];
  }
  export interface TupleElement extends std.BaseObject {
    "name"?: string | null;
    "type": Type;
  }
  export interface TupleExprAlias extends Tuple {}
  export type TypeModifier = "SetOfType" | "OptionalType" | "SingletonType";
  export type Volatility = "Immutable" | "Stable" | "Volatile" | "Modifying";
}
export namespace utils {
  export interface SassHeader extends std.$Object {
    "includeOrder": number;
    "internal": boolean;
    "name": string;
    "value": string;
  }
}
export interface types {
  "std": {
    "BaseObject": std.BaseObject;
    "Object": std.$Object;
    "Endian": std.Endian;
    "FreeObject": std.FreeObject;
    "JsonEmpty": std.JsonEmpty;
    "enc": {
      "Base64Alphabet": std.enc.Base64Alphabet;
    };
    "fts": {
      "ElasticLanguage": std.fts.ElasticLanguage;
      "Language": std.fts.Language;
      "LuceneLanguage": std.fts.LuceneLanguage;
      "PGLanguage": std.fts.PGLanguage;
      "Weight": std.fts.Weight;
    };
    "net": {
      "RequestFailureKind": std.net.RequestFailureKind;
      "RequestState": std.net.RequestState;
      "http": {
        "Method": std.net.http.Method;
        "Response": std.net.http.Response;
        "ScheduledRequest": std.net.http.ScheduledRequest;
      };
    };
  };
  "cfg": {
    "ConfigObject": cfg.ConfigObject;
    "AbstractConfig": cfg.AbstractConfig;
    "AllowBareDDL": cfg.AllowBareDDL;
    "Auth": cfg.Auth;
    "AuthMethod": cfg.AuthMethod;
    "DatabaseConfig": cfg.DatabaseConfig;
    "BranchConfig": cfg.BranchConfig;
    "Config": cfg.Config;
    "ConnectionTransport": cfg.ConnectionTransport;
    "EmailProviderConfig": cfg.EmailProviderConfig;
    "ExtensionConfig": cfg.ExtensionConfig;
    "InstanceConfig": cfg.InstanceConfig;
    "JWT": cfg.JWT;
    "Password": cfg.Password;
    "QueryCacheMode": cfg.QueryCacheMode;
    "QueryStatsOption": cfg.QueryStatsOption;
    "SCRAM": cfg.SCRAM;
    "SMTPProviderConfig": cfg.SMTPProviderConfig;
    "SMTPSecurity": cfg.SMTPSecurity;
    "StoreMigrationSDL": cfg.StoreMigrationSDL;
    "Trust": cfg.Trust;
    "mTLS": cfg.mTLS;
  };
  "sys": {
    "SystemObject": sys.SystemObject;
    "ExternalObject": sys.ExternalObject;
    "Branch": sys.Branch;
    "Database": sys.Database;
    "ExtensionPackage": sys.ExtensionPackage;
    "ExtensionPackageMigration": sys.ExtensionPackageMigration;
    "OutputFormat": sys.OutputFormat;
    "QueryStats": sys.QueryStats;
    "QueryType": sys.QueryType;
    "Role": sys.Role;
    "TransactionAccessMode": sys.TransactionAccessMode;
    "TransactionDeferrability": sys.TransactionDeferrability;
    "TransactionIsolation": sys.TransactionIsolation;
    "VersionStage": sys.VersionStage;
  };
  "coreforce": {
    "CartItem": coreforce.CartItem;
    "Contact": coreforce.Contact;
    "EmailTask": coreforce.EmailTask;
    "EmailTaskStep": coreforce.EmailTaskStep;
  };
  "default": {
    "Account": $default.Account;
    "InngestError": $default.InngestError;
    "Session": $default.Session;
    "User": $default.User;
    "UserPermission": $default.UserPermission;
    "VerificationToken": $default.VerificationToken;
  };
  "ecommerce": {
    "Category": ecommerce.Category;
    "Department": ecommerce.Department;
    "Location": ecommerce.Location;
    "Manufacturer": ecommerce.Manufacturer;
    "Product": ecommerce.Product;
    "Tag": ecommerce.Tag;
  };
  "schema": {
    "AccessKind": schema.AccessKind;
    "Object": schema.$Object;
    "SubclassableObject": schema.SubclassableObject;
    "InheritingObject": schema.InheritingObject;
    "AnnotationSubject": schema.AnnotationSubject;
    "AccessPolicy": schema.AccessPolicy;
    "AccessPolicyAction": schema.AccessPolicyAction;
    "Alias": schema.Alias;
    "Annotation": schema.Annotation;
    "Type": schema.Type;
    "PrimitiveType": schema.PrimitiveType;
    "CollectionType": schema.CollectionType;
    "Array": schema.Array;
    "ArrayExprAlias": schema.ArrayExprAlias;
    "CallableObject": schema.CallableObject;
    "Cardinality": schema.Cardinality;
    "VolatilitySubject": schema.VolatilitySubject;
    "Cast": schema.Cast;
    "ConsistencySubject": schema.ConsistencySubject;
    "Constraint": schema.Constraint;
    "Delta": schema.Delta;
    "Extension": schema.Extension;
    "Function": schema.Function;
    "FutureBehavior": schema.FutureBehavior;
    "Global": schema.Global;
    "Index": schema.Index;
    "IndexDeferrability": schema.IndexDeferrability;
    "Pointer": schema.Pointer;
    "Source": schema.Source;
    "Link": schema.Link;
    "Migration": schema.Migration;
    "MigrationGeneratedBy": schema.MigrationGeneratedBy;
    "Module": schema.Module;
    "MultiRange": schema.MultiRange;
    "MultiRangeExprAlias": schema.MultiRangeExprAlias;
    "ObjectType": schema.ObjectType;
    "Operator": schema.Operator;
    "OperatorKind": schema.OperatorKind;
    "Parameter": schema.Parameter;
    "ParameterKind": schema.ParameterKind;
    "Property": schema.Property;
    "PseudoType": schema.PseudoType;
    "Range": schema.Range;
    "RangeExprAlias": schema.RangeExprAlias;
    "Rewrite": schema.Rewrite;
    "RewriteKind": schema.RewriteKind;
    "ScalarType": schema.ScalarType;
    "SourceDeleteAction": schema.SourceDeleteAction;
    "TargetDeleteAction": schema.TargetDeleteAction;
    "Trigger": schema.Trigger;
    "TriggerKind": schema.TriggerKind;
    "TriggerScope": schema.TriggerScope;
    "TriggerTiming": schema.TriggerTiming;
    "Tuple": schema.Tuple;
    "TupleElement": schema.TupleElement;
    "TupleExprAlias": schema.TupleExprAlias;
    "TypeModifier": schema.TypeModifier;
    "Volatility": schema.Volatility;
  };
  "utils": {
    "SassHeader": utils.SassHeader;
  };
}


export namespace helper {
  type LinkType = std.BaseObject | std.BaseObject[];

  export type propertyKeys<T> = {
    [k in keyof T]: NonNullable<T[k]> extends LinkType ? never : k;
  }[keyof T];

  export type linkKeys<T> = {
    [k in keyof T]: NonNullable<T[k]> extends LinkType ? k : never;
  }[keyof T];

  export type Props<T> = Pick<T, propertyKeys<T>>;
  export type Links<T> = Pick<T, linkKeys<T>>;
}
