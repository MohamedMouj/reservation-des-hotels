<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_creates_a_client_even_if_role_is_submitted(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Client Test',
            'email' => 'client@example.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'telephone' => '+212 600 000 000',
            'role' => 'admin',
        ])->assertOk()
            ->assertJsonPath('user.role', 'client')
            ->assertJsonPath('user.telephone', '+212 600 000 000');

        $this->assertDatabaseHas('users', [
            'email' => 'client@example.test',
            'role' => 'client',
            'telephone' => '+212 600 000 000',
        ]);
    }

    public function test_admin_endpoints_reject_clients_and_unauthenticated_requests(): void
    {
        $this->getJson('/api/admin/reservations')->assertUnauthorized();

        $client = User::factory()->create(['role' => 'client']);
        Sanctum::actingAs($client);

        $this->getJson('/api/admin/reservations')->assertForbidden();
        $this->getJson('/api/admin/users')->assertForbidden();
        $this->postJson('/api/hotels', [])->assertForbidden();
    }

    public function test_login_issues_a_token_and_logout_revokes_it(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.test',
            'password' => 'password123',
        ]);

        $login = $this->postJson('/api/login', [
            'email' => 'login@example.test',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('user.id', $user->id);

        $token = $login->json('access_token');
        $this->withToken($token)->getJson('/api/user')->assertOk();
        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
        \Illuminate\Support\Facades\Auth::forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertUnauthorized();
    }

    public function test_admin_can_read_reservations_users_and_analytics(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->getJson('/api/admin/reservations')->assertOk()->assertJsonPath('data', []);
        $this->getJson('/api/admin/users')->assertOk()->assertJsonPath('data.0.role', 'admin');
        $this->getJson('/api/admin/analytics')->assertOk()
            ->assertJsonPath('total_reservations', 0);
    }
}
