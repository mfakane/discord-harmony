declare module 'playmusic' {
  import { IncomingMessage } from 'http';
  import { Stream } from 'stream';

  export = PlayMusic;

  class PlayMusic {
    init (config: { email: string, password?: string, masterToken?: string }, callback: (err: Error) => void): void;
    login (opt: { email: string, androidId: string }, callback: (err: Error) => void): void;
    getSettings (callback: (err: Error, settings: PlayMusic.Settings) => void): void;
    getAllTracks (callback: (err: Error, trackList: PlayMusic.ListResponse<PlayMusic.Track>) => void): void;
    getAllTracks (opts: { limit?: number, nextPageToken?: string }, callback: (err: Error, trackList: PlayMusic.ListResponse<PlayMusic.Track>) => void): void;
    getStreamUrl (id: string, callback: (err: Error, streamUrl: string) => void): void;
    getStream (id: string, callback: (err: Error, stream: IncomingMessage) => void): void;
    search (text: string, maxResults: number, callback: (err: Error, searchResults: PlayMusic.SearchResponse) => void): void;
    getPlayLists (callback: (err: Error, playlists: PlayMusic.ListResponse<PlayMusic.Playlist>) => void): void;
    addPlayList (playlistName: string, callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void): void;
    deletePlayList (playlistName: string, callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void): void;
    updatePlayListMeta (playlistName: string, updates: { name?: string, description?: string, shareState?: boolean }, callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void): void;
    addTrackToPlayList (songId: string, playlistId: string, callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void, entryBeforeClientId?: string, entryAfterClientId?: string): void;
    addTrackToPlayList (songIds: string[], playlistId: string, callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void, entryBeforeClientId?: string, entryAfterClientId?: string): void;
    movePlayListEntry (entryToMove: string, entryBeforeClentId: string, entryAfterClientId: string, callback: (err: Error, playlistEntries: PlayMusic.BatchMutateResponse) => void): void;
    incrementTrackPlaycount (songId: string, callback: (err: Error, mutationStatus: PlayMusic.TrackStatsResponse) => void): void;
    changeTrackMetadata (song: PlayMusic.Track, callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void): void;
    removePlayListEntry (entryId: string, callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void): void;
    removePlayListEntry (entryIds: string[], callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void): void;
    getPlayListEntries (opts: { limit?: number, nextPageToken?: string }, callback: (err: Error, playlistEntries: PlayMusic.ListResponse<PlayMusic.PlaylistEntry>) => void): void;
    getSharedPlayListEntries (opts: { limit?: number, nextPageToken?: string, shareToken: string }, callback: (err: Error, playlistEntries: PlayMusic.ListResponse<PlayMusic.PlaylistEntry>) => void): void;
    getAlbum (albumId: string, includeTracks: boolean, callback: (err: Error, albumInfo: PlayMusic.Album) => void): void;
    getAllAccessTrack (trackId: string, callback: (err: Error, trackInfo: PlayMusic.Track) => void): void;
    getArtist (albumId: string, includeAlbums: boolean, topTrackCount: number, relatedArtistCount: number, callback: (err: Error, artistInfo: PlayMusic.Artist) => void): void;
    getStations (callback: (err: Error, stationList: PlayMusic.ListResponse<PlayMusic.Station>) => void): void;
    createStation (name: string, seedId: string, type: "track" | "artist" | "album" | "genre", callback: (err: Error, mutationStatus: PlayMusic.BatchMutateResponse) => void): void;
    getStationTracks (stationId: string, tracks: number, callback: (err: Error, stationInfo: PlayMusic.StationTracksResponse) => void): void;
    getFavorites (callback: (err: Error, result: any) => void): void;
  }

  namespace PlayMusic {
    interface Settings {
      settings: {
        lab: any[];
        uploadDevice: any[];
        entitlementInfo: {
          isTrial: boolean;
          isCanceled: boolean;
          expirationMillis: number;
        };
        subscriptionNewsletter: false;
      };
    }

    interface SearchResponse {
      kind: string;
      clusterOrder?: string[];
      entries?: SearchResult[];
      suggestedQuery?: string;
    }

    interface StationTracksResponse {
      kind: string;
      data?: {
        stations: Station[];
      };
    }

    interface TrackStatsResponse {
      responses: {
        id?: string;
        response_code: string;
      }[];
    }

    interface ListResponse<T> {
      kind: string;
      nextPageToken?: string;
      data?: { items: T[]; };
    }

    interface BatchMutateResponse {
      mutate_response: {
        id?: string;
        client_id?: string;
        response_code: string;
      }[];
    }

    interface ColorStyles {
      primary: { red: number, green: number, blue: number };
      scrim: { red: number, green: number, blue: number };
      accenbt: { red: number, green: number, blue: number };
    }

    interface Image {
      kind: string;
      url: string;
      aspectRatio?: string;
      autogen?: boolean;
      colorStyles?: ColorStyles;
    }

    interface Video {
      kind: string;
      id: string;
      title?: string;
      thumbnails?: { uwl: string, width: number, height: number }[];
    }

    interface Track {
      kind: string;
      title: string;
      artist: string;
      album: string;
      albumArtist: string;
      trackNumber: number;
      totalTrackCount?: number;
      durationMillis: string;
      albumArtRef?: { url: string; }[];
      artistArtRef?: { url: string; }[];
      discNumber: number;
      totalDiscCount?: number;
      estimatedSize?: string;
      trackType?: string;
      storeId?: string;
      albumId: string;
      artistId?: string[];
      nid?: string;
      trackAvailableForPurchase?: boolean;
      albumAvailableForPurchase?: boolean;
      composer: string;
      playCount?: number;
      year?: number;
      rating?: string;
      genre?: string;
      trackAvailableForSubscription?: boolean;
      lastRatingChangeTimestamp?: string;
      primaryVideo?: Video;
      lastModifiedTimestamp?: string;
      explicitType?: string;
      contentType?: string;
      deleted?: boolean;
      creationTimestamp?: string;
      comment?: string;
      beatsPerMinute?: number;
      recentTimestamp?: string;
      clientId?: string;
      id?: string;
    }

    interface Playlist {
      kind: string;
      name: string;
      deleted?: boolean;
      type?: string;
      lastModifiedTimestamp?: string;
      recentTimestamp?: string;
      shareToken: string;
      ownerProfilePhotoUrl?: string;
      ownerName?: string;
      accessControlled?: boolean;
      shareState?: string;
      creationTimestamp?: string;
      id?: string;
      albumArtRef?: { url: string; }[];
      description?: string;
      explicitType?: string;
      contentType?: string;
    }

    interface PlaylistEntry {
      kind: string;
      id: string;
      cliendId: string;
      playlistId: string;
      absolutePosition: string;
      trackId: string;
      creationTimestamp: string;
      lastModifiedTimestamp: string;
      deleted: boolean;
      source: string;
      track?: Track;
    }

    interface Attribution {
      kind: string;
      license_url?: string;
      license_title?: string;
      source_title?: string;
      source_url?: string;
    }

    interface Album {
      kind: string;
      name: string;
      albumArtist: string;
      albumArtRef?: string;
      albumId: string;
      artist: string;
      artistId: string[];
      year?: number;
      tracks?: Track[];
      description?: string;
      description_attribution?: Attribution;
      explicitType?: string;
      contentType?: string;
    }

    interface Artist {
      kind: string;
      name: string;
      artistArtRef?: string;
      artistArtRefs?: Image[];
      artistBio?: string;
      artistId?: string;
      albums?: Album[];
      topTracks?: Track[];
      total_albums?: number;
      artist_bio_attribution?: Attribution;
      related_artists?: Artist[];
    }

    interface Genre {
      kind: string;
      id: string;
      name: string;
      children?: string[];
      parentId?: string;
      images?: { url: string; }[];
    }

    interface StationMetadataSeed {
      kind: string;
      artist?: Artist;
      genre?: Genre;
    }

    interface StationSeed {
      kind: string;
      seedType: string;
      albumId?: string;
      artistId?: string;
      genreId?: string;
      trackId?: string;
      trackLockerId?: string;
      curatedStationId?: string;
      metadataSeed?: StationMetadataSeed;
    }

    interface StationTrack extends Track {
      wentryid?: string;
    }

    interface Station {
      imageUrl?: string;
      kind: string;
      name: string;
      deleted?: boolean;
      lastModifiedTimestamp?: string;
      recentTimestamp?: string;
      clientId?: string;
      sessionToken?: string;
      skipEventHistory: any[];
      seed: StationSeed;
      stationSeeds: StationSeed[];
      id?: string;
      description?: string;
      tracks?: StationTrack[];
      imageUrls?: Image[];
      compositeArtRefs?: Image[];
      contentTypes?: string[];
      byline?: string;
      adTargeting?: string[];
    }

    interface ListenNowAlbum {
      artist_metajam_id: string;
      artist_name: string;
      artist_profile_image: { url: string; };
      description: string;
      description_attribution: Attribution;
      explicitType?: string;
      id: { metajamCompactKey: string; artist: string; title: string; };
      title: string;
    }

    interface ListenNowStation {
      highlight_color?: string;
      id: { seeds: StationSeed[]; };
      profile_image?: { url: string; };
      title: string;
    }

    interface ListenNowItem {
      kind: string;
      compositeArtRefs?: Image[];
      images?: Image[];
      suggestion_reason: string;
      suggestion_text: string;
      type: string;
      album?: ListenNowAlbum;
      radio_station?: ListenNowStation;
    }

    interface PodcastGenre {
      id: string;
      displayName: string;
      subgroups?: PodcastGenre[];
    }

    interface PodcastEpisode {
      art?: Image[];
      author?: string;
      deleted?: boolean;
      description?: string;
      durationMillis: string;
      episodeId: string;
      explicitType: string;
      fileSize: string;
      playbackPositionMillis?: string;
      publicationTimestampMillis?: string;
      seriesId: string;
      seriesTitle: string;
      title: string;
    }

    interface PodcastSeries {
      art?: Image[];
      author: string;
      continuationToken?: string;
      copyright?: string;
      description?: string;
      eposides?: PodcastEpisode[];
      explicitType: string;
      link?: string;
      seriesId: string;
      title: string;
      totalNumEposides: number;
      userPreferences?: {
        autoDownload?: boolean;
        notiyOnNewEpisode?: boolean;
        subscribed: boolean;
      };
    }

    interface Situation {
      description: string;
      id: string;
      imageUrl?: string;
      title: string;
      wideImageUrl?: string;
      stations?: Station[];
      situations?: Situation[];
    }

    interface SearchResult {
      score?: number;
      type: string;
      best_result?: boolean;
      navigational_result?: boolean;
      navigational_confidence?: number;
      artist?: Artist;
      album?: Album;
      track?: Track;
      playlist?: Playlist;
      series?: PodcastSeries;
      station?: Station;
      situation?: Situation;
      youtube_video?: Video;
    }
  }
}
