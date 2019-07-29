import { App } from '../app.ts'

/**
 * IsProvider interface.
 *
 * @export
 * @interface isProvider
 */
export interface isProvider {

    /**
     * Creates an instance of Provider.
     *
     * @param {App} app
     * @returns {Provider}
     * @memberof isProvider
     */
    new(app: App): Provider

}

/**
 * Provider class.
 *
 * @export
 * @abstract
 * @class Provider
 */
export abstract class Provider {

    /**
     * Stores the current application instance.
     *
     * @protected
     * @type {App}
     * @memberof Provider
     */
    protected app: App

    /**
     * Creates an instance of Provider.
     *
     * @param {App} app
     * @memberof Provider
     */
    constructor(app: App) {
        this.app = app
    }

    /**
     * Registers the provider to the service container.
     *
     * @abstract
     * @memberof Provider
     */
    abstract register(): void

    /**
     * This method is called after all other service providers
     * have been registered.
     *
     * @abstract
     * @memberof Provider
     */
    abstract boot(): void

}
