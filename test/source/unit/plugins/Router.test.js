/**
 * @jest-environment jsdom
 */

import Eleva from "../../../../src/index.js";
import { RouterPlugin } from '../../../../src/plugins/Router.js';

describe('RouterPlugin', () => {
    let app;
    let router;

    beforeEach(() => {
        // Create a test DOM element
        document.body.innerHTML = '<div id="app"></div>';

        app = new Eleva('test-app');
    });

    afterEach(() => {
        if (router) {
            router.destroy();
        }
        document.body.innerHTML = '';
    });

    describe('Installation', () => {
        test('should install router plugin successfully', () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            expect(app.router).toBeDefined();
            expect(app.navigate).toBeDefined();
            expect(app.getCurrentRoute).toBeDefined();
            expect(app.getRouteParams).toBeDefined();
            expect(app.getRouteQuery).toBeDefined();
        });

        test('should throw error if mount option is missing', () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            expect(() => {
                app.use(RouterPlugin, {
                    routes: [{ path: '/', component: HomePage }]
                });
            }).toThrow("[RouterPlugin] 'mount' option is required");
        });

        test('should throw error if routes option is missing', () => {
            expect(() => {
                app.use(RouterPlugin, {
                    mount: '#app'
                });
            }).toThrow("[RouterPlugin] 'routes' option must be an array");
        });

        test('should return router instance', () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            expect(router).toBeDefined();
            expect(typeof router.navigate).toBe('function');
            expect(typeof router.start).toBe('function');
        });
    });

    describe('Route Configuration', () => {
        test('should register inline components automatically', () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    { path: '/about', component: AboutPage }
                ]
            });

            // Check if components were registered
            const registeredComponents = Array.from(app._components.keys());
            expect(registeredComponents.some(name => name.includes('ElevaRouteComponent'))).toBe(true);
        });

        test('should support route metadata', () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    {
                        path: '/',
                        component: HomePage,
                        meta: { title: 'Home', requiresAuth: false }
                    }
                ]
            });

            expect(router.routes[0].meta).toEqual({ title: 'Home', requiresAuth: false });
        });

        test('should support global layout', () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const MainLayout = { template: () => '<div><slot></slot></div>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                globalLayout: MainLayout,
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            expect(router.options.globalLayout).toBeDefined();
        });
    });

    describe('Navigation', () => {
        test('should navigate to routes programmatically', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    { path: '/about', component: AboutPage }
                ]
            });

            await router.start();

            // Navigate to about page
            await router.navigate('/about');

            expect(router.currentRoute.value.path).toBe('/about');
        });

        test('should handle route parameters', async () => {
            const UserPage = {
                template: (ctx) => `<h1>User: ${ctx.router.params.id}</h1>`
            };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/users/:id', component: UserPage }
                ]
            });

            await router.start();

            // Navigate to user page with parameter
            await router.navigate('/users/123');

            expect(router.currentRoute.value.path).toBe('/users/123');
            expect(router.currentParams.value.id).toBe('123');
        });

        test('should handle query parameters', async () => {
            const SearchPage = {
                template: (ctx) => `<h1>Search: ${ctx.router.query.q}</h1>`
            };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/search', component: SearchPage }
                ]
            });

            await router.start();

            // Navigate with query parameters
            await router.navigate('/search?q=test');

            expect(router.currentRoute.value.path).toBe('/search');
            expect(router.currentQuery.value.q).toBe('test');
        });

        test('should handle complex navigation objects', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            await router.start();

            // Navigate with complex object
            await router.navigate({
                path: '/',
                query: { tab: 'overview' },
                replace: true,
                state: { from: 'test' }
            });

            expect(router.currentRoute.value.path).toBe('/');
            expect(router.currentQuery.value.tab).toBe('overview');
        });
    });

    describe('Navigation Guards', () => {
        test.skip('should execute global beforeEach guards', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            const guardSpy = jest.fn().mockReturnValue(true);

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    { path: '/about', component: AboutPage }
                ],
                onBeforeEach: guardSpy
            });

            await router.start();

            // Navigate to about page
            await router.navigate('/about');

            expect(guardSpy).toHaveBeenCalled();
            expect(guardSpy.mock.calls[0][0].path).toBe('/about');
        });

        test('should execute route-specific beforeEnter guards', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            const routeGuard = jest.fn().mockReturnValue(true);

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    {
                        path: '/about',
                        component: AboutPage,
                        beforeEnter: routeGuard
                    }
                ]
            });

            await router.start();

            // Navigate to about page
            await router.navigate('/about');

            expect(routeGuard).toHaveBeenCalled();
        });

        test.skip('should block navigation when guard returns false', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            const blockingGuard = jest.fn().mockReturnValue(false);

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    {
                        path: '/about',
                        component: AboutPage,
                        beforeEnter: blockingGuard
                    }
                ]
            });

            await router.start();

            // Try to navigate to about page (should be blocked)
            await router.navigate('/about');

            expect(blockingGuard).toHaveBeenCalled();
            expect(router.currentRoute.value.path).toBe('/');
        });

        test('should redirect when guard returns path', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            const redirectGuard = jest.fn().mockReturnValue('/');

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    {
                        path: '/about',
                        component: AboutPage,
                        beforeEnter: redirectGuard
                    }
                ]
            });

            await router.start();

            // Try to navigate to about page (should redirect to home)
            await router.navigate('/about');

            expect(redirectGuard).toHaveBeenCalled();
            expect(router.currentRoute.value.path).toBe('/');
        });
    });

    describe('Lifecycle Hooks', () => {
        test('should execute afterEnter hooks', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            const afterEnterHook = jest.fn();

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    {
                        path: '/about',
                        component: AboutPage,
                        afterEnter: afterEnterHook
                    }
                ]
            });

            await router.start();

            // Navigate to about page
            await router.navigate('/about');

            expect(afterEnterHook).toHaveBeenCalled();
        });

        test.skip('should execute afterLeave hooks', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            const afterLeaveHook = jest.fn();

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    {
                        path: '/',
                        component: HomePage,
                        afterLeave: afterLeaveHook
                    },
                    { path: '/about', component: AboutPage }
                ]
            });

            await router.start();

            // Navigate from home to about page
            await router.navigate('/about');

            expect(afterLeaveHook).toHaveBeenCalled();
        });
    });

    describe('Reactive State', () => {
        test.skip('should provide reactive route state', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    { path: '/about', component: AboutPage }
                ]
            });

            await router.start();

            // Watch route changes
            const routeChanges = [];
            router.currentRoute.watch(route => {
                routeChanges.push(route);
            });

            // Navigate to about page
            await router.navigate('/about');

            expect(routeChanges.length).toBeGreaterThan(0);
            expect(routeChanges[routeChanges.length - 1].path).toBe('/about');
        });

        test('should provide reactive params state', async () => {
            const UserPage = { template: () => '<h1>User</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/users/:id', component: UserPage }
                ]
            });

            await router.start();

            // Watch params changes
            const paramChanges = [];
            router.currentParams.watch(params => {
                paramChanges.push(params);
            });

            // Navigate to user page
            await router.navigate('/users/123');

            expect(paramChanges.length).toBeGreaterThan(0);
            expect(paramChanges[paramChanges.length - 1].id).toBe('123');
        });
    });

    describe('Plugin System', () => {
        test('should support router-level plugins', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            const testPlugin = {
                name: 'test-plugin',
                install: jest.fn()
            };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            await router.start();

            // Use router-level plugin
            router.use(testPlugin, { test: true });

            expect(testPlugin.install).toHaveBeenCalledWith(router, { test: true });
            expect(router.getPlugin('test-plugin')).toBe(testPlugin);
        });

        test('should prevent duplicate plugin registration', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            const testPlugin = {
                name: 'test-plugin',
                install: jest.fn()
            };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            await router.start();

            // Register plugin twice
            router.use(testPlugin);
            router.use(testPlugin);

            expect(testPlugin.install).toHaveBeenCalledTimes(1);
        });

        test('should clean up plugins on destroy', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            const testPlugin = {
                name: 'test-plugin',
                install: jest.fn(),
                destroy: jest.fn()
            };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            await router.start();

            router.use(testPlugin);
            await router.destroy();

            expect(testPlugin.destroy).toHaveBeenCalledWith(router);
        });
    });

    describe('Error Handling', () => {
        test.skip('should handle navigation errors gracefully', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            await router.start();

            // Try to navigate to non-existent route
            await router.navigate('/non-existent');

            // Should not throw error, but should emit error event
            expect(router.currentRoute.value.path).toBe('/');
        });

        test.skip('should handle component resolution errors', async () => {
            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: 'NonExistentComponent' }
                ]
            });

            await router.start();

            // Should handle missing component gracefully
            expect(router.currentRoute.value.path).toBe('/');
        });
    });

    describe('Utility Methods', () => {
        test('should provide utility methods on app instance', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };
            const AboutPage = { template: () => '<h1>About</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage },
                    { path: '/about', component: AboutPage }
                ]
            });

            await router.start();

            // Test utility methods
            expect(typeof app.navigate).toBe('function');
            expect(typeof app.getCurrentRoute).toBe('function');
            expect(typeof app.getRouteParams).toBe('function');
            expect(typeof app.getRouteQuery).toBe('function');

            // Test utility method functionality
            await app.navigate('/about');
            expect(app.getCurrentRoute().path).toBe('/about');
        });
    });

    describe('Uninstall', () => {
        test('should clean up properly on uninstall', async () => {
            const HomePage = { template: () => '<h1>Home</h1>' };

            router = app.use(RouterPlugin, {
                mount: '#app',
                routes: [
                    { path: '/', component: HomePage }
                ]
            });

            await router.start();

            // Uninstall plugin
            await RouterPlugin.uninstall(app);

            expect(app.router).toBeUndefined();
            expect(app.navigate).toBeUndefined();
            expect(app.getCurrentRoute).toBeUndefined();
            expect(app.getRouteParams).toBeUndefined();
            expect(app.getRouteQuery).toBeUndefined();
        });
    });
});
