import { Controller, Req, Res, UseGuards } from "@nestjs/common"
import { AuthService, EnrichedRequest } from "./auth.service"
import { TsRest, TsRestHandler, tsRestHandler } from "@ts-rest/nest"
import { contract, contractErrors } from "contract"
import { Response } from "express"
import { EnvService } from "src/env/env.service"
import { JwtAuthGuard, RefreshTokenGuard } from "./jwt-auth.guard"

const c = contract.auth

@TsRest({ jsonQuery: true })
@Controller()
export class AuthController{

    private static readonly cookieOptions = {
        secure: true,
        sameSite: true,
        HttpOnly: true,
    } as const

	constructor(private authService: AuthService) {}

    private async setNewTokensAsCookies(res: Response, user: EnrichedRequest['user']) {
        const tokens = await this.authService.getTokens(user)
        // TODO maybe add life time to cookie ?
        res.cookie("access_token", tokens.accessToken, AuthController.cookieOptions)
        res.cookie("refresh_token", tokens.refreshToken, AuthController.cookieOptions)
        this.authService.updateRefreshToken(user.username, tokens.refreshToken)
    }

	@TsRestHandler(c.login)
	async login(@Res({ passthrough: true }) res: Response) {
        return tsRestHandler(c.login, async ({ body: { code } }) => {
            const user = await this.authService.validateUser(code)
            if (!user)
                return contractErrors.Unauthorized()
            await this.setNewTokensAsCookies(res, user)
            return { status: 200, body: user }
        })
	}

    @TsRestHandler(c.loginDev)
    async loginDev(@Res({ passthrough: true }) res: Response) {
        return tsRestHandler(c.loginDev, async ({ body: { username } }) => {
            if (EnvService.env.MODE === "PROD")
                return contractErrors.OnlyAvailableInDevMode('loginDev')
            const user = await this.authService.validateUserDev(username)
            if (!user)
                return { status: 404, body: { code: "NotFound" } }
            await this.setNewTokensAsCookies(res, user)
            return { status: 200, body: user }
        })
    }

    @UseGuards(JwtAuthGuard)
	@TsRestHandler(c.logout)
	async logout(@Res({ passthrough: true }) res: Response, @Req(){ user: { username } }: EnrichedRequest) {
        return tsRestHandler(c.logout, async () => {
            res.cookie("access_token", "", { expires: new Date(0) })
            res.cookie("refresh_token", "", { expires: new Date(0) })
            this.authService.revokeRefreshToken(username)
            return { status: 200 as const, body: null }
        })
	}

    @UseGuards(RefreshTokenGuard)
    @TsRestHandler(c.refreshTokens)
    async refreshTokens(
        @Res({ passthrough: true })res: Response,
        @Req(){ user: { username, refreshToken } }: Omit<Request, "user"> & Record<"user", EnrichedRequest['user'] & { refreshToken: string }>
    ) {
        const user = await this.authService.doesRefreshTokenMatch(username, refreshToken)
        if (!user)
            return contractErrors.Unauthorized()
        await this.setNewTokensAsCookies(res, user)
        return tsRestHandler(c.refreshTokens, async () => {
            return { status: 200, body: null }       
        })
    }

}
