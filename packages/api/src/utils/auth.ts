/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SetMetadata } from "@nestjs/common";

/**
 * Decorator to remove any JWT auth protection.
 * Use it in controller methods like
 *
 * ```typescript
 * @NoAuth()
 * @Get()
 * aRoute(@Body() param: ADto): Promise<AnotherDto> {}
 * ```
 */
export const NoAuth = () => SetMetadata("no-auth", true);
