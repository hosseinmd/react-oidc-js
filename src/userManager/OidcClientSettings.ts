// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import { WebStorageStateStore } from "./WebStorageStateStore";
import type { OidcMetadata } from "./OidcMetadata";
import type { StateStore } from "./StateStore";
import { Storage } from "./Storage";

const DefaultResponseType = "code";
const DefaultScope = "openid";
const DefaultClientAuthentication = "client_secret_post";
const DefaultResponseMode = "query";
const DefaultStaleStateAgeInSeconds = 60 * 15;
const DefaultClockSkewInSeconds = 60 * 5;

/** @public */
export type SigningKey = Record<string, string | string[]>;

/**
 * The settings used to configure the {@link OidcClient}.
 *
 * @public
 */
export interface OidcClientSettings {
  /** The URL of the OIDC/OAuth2 provider */
  authority: string;
  /** Your client application's identifier as registered with the OIDC/OAuth2 */
  client_id: string;
  /** Optional protocol param */
  prompt?: string;
  /** Optional protocol param */
  display?: string;
  /** Optional protocol param */
  max_age?: number;
  /** Optional protocol param */
  ui_locales?: string;
  /** Optional protocol param */
  acr_values?: string;
  /** Optional protocol param */
  resource?: string;

  /** Optional protocol param (default: "query") */
  response_mode?: "query" | "fragment";

  /** Should OIDC protocol claims be removed from profile (default: true) */
  filterProtocolClaims?: boolean;
  /**
   * Flag to control if additional identity data is loaded from the user info
   * endpoint in order to populate the user's profile (default: false)
   */
  loadUserInfo?: boolean;
  /**
   * Number (in seconds) indicating the age of state entries in storage for
   * authorize requests that are considered abandoned and thus can be cleaned up
   * (default: 300)
   */
  staleStateAgeInSeconds?: number;
  /**
   * The window of time (in seconds) to allow the current time to deviate when
   * validating token's iat, nbf, and exp values (default: 300)
   */
  clockSkewInSeconds?: number;
  userInfoJwtIssuer?: "ANY" | "OP" | string;

  /**
   * Indicates if objects returned from the user info endpoint as claims (e.g.
   * `address`) are merged into the claims from the id token as a single object.
   * Otherwise, they are added to an array as distinct objects for the claim
   * type. (default: false)
   */
  mergeClaims?: boolean;

  /**
   * Storage object used to persist interaction state (default:
   * window.localStorage, InMemoryWebStorage iff no window). E.g. `stateStore:
   * new WebStorageStateStore({ store: window.localStorage })`
   */
  stateStore?: StateStore;

  /**
   * An object containing additional query string parameters to be including in
   * the authorization request. E.g, when using Azure AD to obtain an access
   * token an additional resource parameter is required. extraQueryParams:
   * `{resource:"some_identifier"}`
   */
  extraQueryParams?: Record<string, string | number | boolean>;

  extraTokenParams?: Record<string, unknown>;
}

/**
 * The settings with defaults applied of the {@link OidcClient}.
 *
 * @public
 * @see {@link OidcClientSettings}
 */
export class OidcClientSettingsStore {
  // metadata
  public readonly authority: string;
  public readonly metadataUrl: string | undefined;
  public readonly metadata: Partial<OidcMetadata> | undefined;
  public readonly metadataSeed: Partial<OidcMetadata> | undefined;
  public readonly signingKeys: SigningKey[] | undefined;

  // client config
  public readonly client_id: string;
  public readonly client_secret: string | undefined;

  // optional protocol params
  public readonly prompt: string | undefined;
  public readonly display: string | undefined;
  public readonly max_age: number | undefined;
  public readonly ui_locales: string | undefined;
  public readonly acr_values: string | undefined;
  public readonly resource: string | undefined;
  public readonly response_mode: "query" | "fragment";

  // behavior flags
  public readonly filterProtocolClaims: boolean;
  public readonly loadUserInfo: boolean;
  public readonly staleStateAgeInSeconds: number;
  public readonly clockSkewInSeconds: number;
  public readonly userInfoJwtIssuer: "ANY" | "OP" | string;
  public readonly mergeClaims: boolean;

  public readonly stateStore: StateStore;

  // extra
  public readonly extraQueryParams: Record<string, string | number | boolean>;
  public readonly extraTokenParams: Record<string, unknown>;

  public constructor({
    authority,
    // client related
    client_id,
    // optional protocol
    prompt,
    display,
    max_age,
    ui_locales,
    acr_values,
    resource,
    response_mode = DefaultResponseMode,
    // behavior flags
    filterProtocolClaims = true,
    loadUserInfo = false,
    staleStateAgeInSeconds = DefaultStaleStateAgeInSeconds,
    clockSkewInSeconds = DefaultClockSkewInSeconds,
    userInfoJwtIssuer = "OP",
    mergeClaims = false,
    // other behavior
    stateStore,
    // extra query params
    extraQueryParams = {},
    extraTokenParams = {},
  }: OidcClientSettings) {
    this.authority = authority;
    this.client_id = client_id;

    this.prompt = prompt;
    this.display = display;
    this.max_age = max_age;
    this.ui_locales = ui_locales;
    this.acr_values = acr_values;
    this.resource = resource;
    this.response_mode = response_mode;

    this.filterProtocolClaims = !!filterProtocolClaims;
    this.loadUserInfo = !!loadUserInfo;
    this.staleStateAgeInSeconds = staleStateAgeInSeconds;
    this.clockSkewInSeconds = clockSkewInSeconds;
    this.userInfoJwtIssuer = userInfoJwtIssuer;
    this.mergeClaims = !!mergeClaims;

    if (stateStore) {
      this.stateStore = stateStore;
    } else {
      const store = Storage;
      this.stateStore = new WebStorageStateStore({ store });
    }

    this.extraQueryParams = extraQueryParams;
    this.extraTokenParams = extraTokenParams;
  }
}
