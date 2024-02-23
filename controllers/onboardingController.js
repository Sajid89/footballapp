const axios = require('axios');
const apiConfig = require('../config/api');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/response');

// Get all leagues
const getAllLeagues = async (req, res) => {
    const options = {
        method: 'GET',
        url: `${apiConfig.baseURL_V3}/leagues`,
        headers: apiConfig.headers
    };

    try {
        const response = await axios.request(options);
        const leagues = response.data.response.map(item => {
            return {
                league: item.league,
            };
        });

        const result = {
            get: response.data.get,
            parameters: response.data.parameters,
            errors: response.data.errors,
            results: response.data.results,
            paging: response.data.paging,
            leagues: leagues
        };

        sendSuccessResponse(res, 'All leagues around the world.', result, 200);
    } catch (error) {
        sendErrorResponse(res, `An error occurred while fetching leagues.: ${error.message}`, 500);
    }
};

// Get teams in a league
const getTeamsInLeague = async (req, res) => {
    const leagueId = req.params.leagueId;
    const options = {
        method: 'GET',
        url: `${apiConfig.baseURL_V2}/teams/league/${leagueId}`,
        headers: apiConfig.headers
    };

    try {
        const response = await axios.request(options);
        const teams = response.data.api.teams.map(item => {
            return {
                team_id: item.team_id,
                name: item.name,
                code: item.code,
                logo: item.logo,
                country: item.country
            };
        });

        const result = {
            results: response.data.api.results,
            teams: teams
        };

        sendSuccessResponse(res, 'All the teams for a given league.', result, 201);
    } catch (error) {
        sendErrorResponse(res, `An error occurred while fetching teams.: ${error.message}`, 500);
    }
};

// Get players in a team
const getPlayersInTeam = async (req, res) => {
    const teamId = req.params.teamId;
    const options = {
        method: 'GET',
        url: `${apiConfig.baseURL_V3}/players`,
        params: {
            team: teamId,
            season: 2023
        },
        headers: apiConfig.headers
    }; 

    try {
        const response = await axios.request(options);
        const players = response.data.response.map(item => {
            return {
                id: item.player.id,
                name: item.player.name,
                firstname: item.player.firstname,
                lastname: item.player.lastname,
                age: item.player.age,
                nationality: item.player.nationality,
                photo: item.player.photo
            };
        });

        const result = {
            get: response.data.get,
            parameters: response.data.parameters,
            errors: response.data.errors,
            results: response.data.results,
            paging: response.data.paging,
            players: players
        };

        sendSuccessResponse(res, 'All plaers in the team.', result, 200);
    } catch (error) {
        sendErrorResponse(res, `An error occurred while fetching players.: ${error.message}`, 500);
    }
};

module.exports = {
    getAllLeagues,
    getTeamsInLeague,
    getPlayersInTeam
};