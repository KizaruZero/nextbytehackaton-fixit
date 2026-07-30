package middleware

import "github.com/gofiber/fiber/v2"

const DeviceTokenKey = "device_token"

func DeviceToken() fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Get("X-Device-Token")
		if token == "" {
			token = "anonymous"
		}
		c.Locals(DeviceTokenKey, token)
		return c.Next()
	}
}
