import {useMemo} from 'react'
import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client'
import merge from 'deepmerge'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apolloClient: ApolloClient<any>

function createApolloClient() {
    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link: new HttpLink({
            uri: 'http://localhost:1337/graphql',
        }),
        cache: new InMemoryCache(),
    })
}

export function initializeApollo(initialState: any = null) {
    const _apolloClient = apolloClient ?? createApolloClient()
    if (initialState) {
        const existingCache = _apolloClient.extract()
        const data = merge(initialState, existingCache)
        _apolloClient.cache.restore(data)
    }
    if (typeof window === 'undefined') return _apolloClient
    if (!apolloClient) apolloClient = _apolloClient
    return _apolloClient
}

export function addApolloState(client: any, pageProps: any) {
    if (pageProps?.props) {
        pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
    }
    return pageProps
}

export function useApollo(pageProps: any) {
    const state = pageProps[APOLLO_STATE_PROP_NAME]
    return useMemo(() => initializeApollo(state), [state])
}
