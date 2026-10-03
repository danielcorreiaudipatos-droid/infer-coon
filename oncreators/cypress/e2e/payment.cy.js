describe('Payment Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('should complete payment flow', () => {
    // Login
    cy.get('a[href="/login"]').click()
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Wait for dashboard
    cy.url().should('include', '/dashboard')

    // Go to pricing
    cy.get('a[href="/pricing"]').click()

    // Select plan
    cy.contains('Premium').parent().find('button').click()

    // Check out
    cy.url().should('include', '/checkout')

    // Fill in payment details
    cy.get('input[placeholder="Card number"]').type('4242424242424242')
    cy.get('input[placeholder="MM/YY"]').type('12/25')
    cy.get('input[placeholder="CVC"]').type('123')

    // Submit payment
    cy.get('button').contains('Pay').click()

    // Verify success
    cy.url().should('include', '/payment/success')
    cy.contains('Payment Confirmed').should('be.visible')
  })

  it('should handle payment failure', () => {
    cy.visit('http://localhost:3000/checkout/plan-123')

    // Fill with failing card
    cy.get('input[placeholder="Card number"]').type('4000000000000002')
    cy.get('input[placeholder="MM/YY"]').type('12/25')
    cy.get('input[placeholder="CVC"]').type('123')

    cy.get('button').contains('Pay').click()

    // Should show error
    cy.contains('Payment Failed').should('be.visible')
  })
})
