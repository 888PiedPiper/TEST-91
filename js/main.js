// ==================== НАСТРОЙКИ ====================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2kcIkzCp2NmuRzLJHEkFGU0Z9ddSJzaj15kkPwyFBEoq0j8g4kTm6YjdsOw5MNePt/exec';
const SHEET_ID = '1CeJjGHytehxVIxSxY_j_mx84EvGzKJNA5x9y9n-MSBs';
const API_KEY = 'AIzaSyCB_5jPpU-GtKmmzx8FTTu33WtbNntxGvg';

// ==================== КЕШИРОВАНИЕ ====================
const CACHE_KEY = 'tournament_cache';
const CACHE_DURATION_USER = 2 * 60 * 1000; // 2 минуты для зрителей
let isAdmin = false;

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let tournamentData = {
    groups: { A: { teams: [], matches: [] }, B: { teams: [], matches: [] } },
    playoffs: {
        upperFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
        lowerSemi: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
        lowerFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
        grandFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' }
    }
};

let scheduleData = {
    periodStart: null, periodEnd: null,
    qfStart: null, qfEnd: null,
    sfStart: null, sfEnd: null,
    final: null,
    prizePool: ''
};

let prizeData = {
    1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: ''
};

let remainingTeamsAll = [];
let currentDrawStep = 0;
let groupATeamsList = [];
let groupBTeamsList = [];
let timerInterval = null;

let tempPlayoffDates = {
    upperFinal: '', lowerSemi: '', lowerFinal: '', grandFinal: ''
};

let tempPlayoffStreamUrls = {
    upperFinal: '', lowerSemi: '', lowerFinal: '', grandFinal: ''
};

// ==================== ПЕРЕВОДЫ ====================
const translations = {
    ru: {
        'tournament_title': 'Турнир — Kraken Chronicles',
        'tournament_subtitle': 'По игре Call of Dragons',
        'schedule_title': 'РАСПИСАНИЕ ТУРНИРА (UTC)',
        'tournament_period': 'НАЧАЛО/ОКОНЧАНИЕ ТУРНИРА:',
        'prize_pool': 'ПРИЗОВОЙ ФОНД:',
        'group_stage': 'ГРУППОВОЙ ЭТАП:',
        'playoffs': 'ПЛЕЙ-ОФФ:',
        'grand_final': 'ГРАНД-ФИНАЛ:',
        'next_match': 'До следующего матча:',
        'edit_schedule': 'Редактировать расписание',
        'save_schedule': 'Сохранить расписание',
        'warning_utc': '⚠️ ВСЕ ДАТЫ ВВОДЯТСЯ В UTC',
        'tournament_period_label': 'Период турнира (UTC)',
        'group_stage_label': 'Групповой этап (UTC)',
        'playoffs_label': 'Плей-офф (UTC)',
        'grand_final_label': 'Гранд-финал (UTC)',
        'prize_pool_label': 'Призовой фонд',
        'start': 'Начало',
        'end': 'Окончание',
        'draw_title': 'ЖЕРЕБЬЁВКА КОМАНД (2 группы по 4 команды)',
        'draw_info': 'Введите названия 8 команд ниже. Нажимайте кнопки по очереди, чтобы распределить команды по группам.',
        'draw_group_a': 'Группа A — 4 команды',
        'draw_group_b': 'Группа B — 4 команды',
        'team': 'Команда',
        'avatar_url': 'Ссылка на аватар (URL)',
        'draw_to_group_a': 'В группу A (команды 1-2)',
        'draw_to_group_b': 'В группу B (команды 3-4)',
        'draw_to_group_a2': 'В группу A (команды 5-6)',
        'draw_to_group_b2': 'В группу B (команды 7-8)',
        'save_draw': 'Сохранить жеребьёвку',
        'clear_teams': 'Очистить команды',
        'group_stage_title': 'ГРУППОВОЙ ЭТАП',
        'group': 'ГРУППА',
        'everyone_with_everyone': 'каждый с каждым — 3 матча на команду',
        'team_header': 'КОМАНДА',
        'wins_header': 'ПОБЕДЫ',
        'points_header': 'ОЧКИ',
        'matches_header': 'МАТЧИ ГРУППЫ',
        'waiting_draw': 'ожидание жеребьёвки',
        'placeholder_text': 'Команды будут распределены после жеребьёвки',
        'eliminated': 'вылет',
        'playoffs_title': 'ПЛЕЙ-ОФФ',
        'upper_bracket': 'ВЕРХНЯЯ СЕТКА',
        'lower_bracket': 'НИЖНЯЯ СЕТКА (LOSERS)',
        'lower_semi': 'ПОЛУФИНАЛ',
        'lower_final': 'ФИНАЛ',
        'grand_final_title': 'ГРАНД-ФИНАЛ',
        'winner_label': 'ПОБЕДИТЕЛЬ:',
        'champion': 'ЧЕМПИОН:',
        'results_title': 'РЕЗУЛЬТАТЫ ТУРНИРА',
        'place_header': 'МЕСТО',
        'team_header_results': 'КОМАНДА',
        'wins_header_results': 'ПОБЕДЫ',
        'points_header_results': 'ОЧКИ',
        'prize_header': 'ПРИЗ',
        'admin_title': 'Доступ администратора',
        'admin_password': 'Введите пароль',
        'admin_login': 'Войти',
        'admin_edit_matches': 'Редактирование матчей',
        'admin_prizes': 'ПРИЗОВОЙ ФОНД ПО МЕСТАМ',
        'admin_place': 'МЕСТО',
        'admin_save_prizes': 'СОХРАНИТЬ ПРИЗЫ',
        'admin_save_sheet': 'Сохранить в Google таблицу',
        'admin_full_reset': 'Полный сброс турнира',
        'admin_save_avatars': 'Сохранить аватары',
        'admin_reset_draw': 'Сбросить жеребьёвку',
        'save': 'СОХРАНИТЬ',
        'live': 'LIVE',
        'vs': 'VS',
        'date_not_set': 'Дата не назначена',
        'on_air': 'В ЭФИРЕ!',
        'rules_title': 'РЕГЛАМЕНТ ТУРНИРА',
        'add_section': '+ ДОБАВИТЬ СЕКЦИЮ',
        'save_rules': 'СОХРАНИТЬ',
        'reset_rules': 'СБРОСИТЬ',
        'loading': 'Загрузка регламента...',
        'empty_rules': 'Регламент пока не заполнен',
        'new_section': 'Новая секция',
        'empty_content': 'Содержание не заполнено',
        'status_saving': 'Сохранение...',
        'status_saved': 'Сохранено!',
        'status_error': 'Ошибка:',
        'status_admin_required': 'Требуется авторизация администратора',
        'status_draw_completed': 'Жеребьёвка завершена!',
        'status_draw_not_completed': 'Жеребьёвка не завершена!',
        'status_cleared': 'Все названия команд очищены',
        'status_full_reset': 'Полный сброс турнира...',
        'status_full_reset_done': 'Полный сброс выполнен!',
        'champion_text': 'ЧЕМПИОН',
        'confirm_clear_teams': 'Очистить все названия команд?',
        'confirm_reset_draw': 'Сброс жеребьёвки очистит все распределение команд по группам. Продолжить?',
        'confirm_full_reset': 'ПОЛНЫЙ СБРОС ТУРНИРА\n\nЭто действие:\n- Удалит все названия команд\n- Обнулит все счета и очки\n- Очистит победителей\n- Сбросит расписание\n- Очистит аватары команд\n- Покажет блок жеребьёвки\n\nПродолжить?',
        'confirm_delete_section': 'Удалить эту секцию?',
        'confirm_reset_rules': 'Сбросить регламент к стандартным значениям?',
        'status_saving_avatars': 'Сохранение команд и аватаров...',
        'status_avatars_saved': 'Команды и аватары сохранены!',
        'status_saving_prizes': 'Сохранение призов...',
        'status_prizes_saved': 'Призы сохранены!',
        'status_saving_schedule': 'Сохранение расписания...',
        'status_schedule_saved': 'Расписание сохранено!',
        'status_saving_draw': 'Сохранение жеребьёвки...',
        'status_draw_saved': 'Жеребьёвка сохранена!',
        'status_saving_tournament': 'Сохранение...',
        'status_tournament_saved': 'Сохранено!',
        'status_password_check': 'Проверка пароля...',
        'status_admin_activated': 'Доступ администратора активирован',
        'status_wrong_password': 'Неверный пароль',
        'status_enter_password': 'Введите пароль',
        'status_auth_required': 'Сначала авторизуйтесь как администратор',
        'status_draw_already_completed': 'Жеребьёвка уже завершена!',
        'status_wrong_turn': 'Сейчас не ваш ход! Ожидается шаг',
        'status_team_not_filled': 'Команда {num} не заполнена!',
        'status_not_enough_teams': 'Недостаточно команд для жеребьёвки',
        'status_draw_reset': 'Жеребьёвка сброшена.',
        'status_exit_admin': 'Выход из режима администратора',
        'admin_score': 'СЧЁТ',
        'admin_points': 'ОЧКИ',
        'admin_date': 'ДАТА',
        'admin_link': 'LINK',
        'admin_save': 'СОХРАНИТЬ',
        'admin_score1': 'Счёт 1',
        'admin_score2': 'Счёт 2',
        'admin_points1': 'Очки 1',
        'admin_points2': 'Очки 2',
        'admin_live_url': 'LIVE URL',
        'admin_winner': 'ПОБЕДИТЕЛЬ:',
        'rules_empty_sections': 'Нет секций. Нажмите "Добавить секцию".',
        'rules_load_error': 'Ошибка загрузки регламента',
        'rules_saving': 'Сохранение регламента...',
        'rules_saved': 'Регламент сохранён!',
        'rules_save_empty_error': 'Нельзя сохранить пустой регламент',
        'rules_resetting': 'Сброс регламента...',
        'rules_reset_done': 'Регламент сброшен к стандарту!',
        'new_section_default': 'Новая секция',
        'new_content_default': 'Текст новой секции...',
        'admin_notification': '🔓 Админ-панель разблокирована. Введите пароль.',
        'draw_status_title': 'Распределение по группам:',
        'draw_group_a_label': 'Группа A:',
        'draw_group_b_label': 'Группа B:',
        'draw_teams_left': 'Осталось команд:',
        'draw_completed_message': 'Жеребьёвка завершена! Нажмите "Сохранить жеребьёвку".',
        'draw_waiting_message': 'пока пусто',
        'team_not_filled_error': 'Команда {num} не заполнена!',
        'group_added_success': 'Команды добавлены в группу {group}',
        'draw_completed_success': 'Жеребьёвка завершена!',
        'team_placeholder': 'Название команды',
        'avatar_placeholder': 'Ссылка на аватар (URL)',
        'prize_placeholder': 'Сумма или приз',
        'data_synced': 'Данные синхронизируются с Google Sheets',
        'loading_rules': 'Загрузка регламента...'
    },
    en: {
        'tournament_title': 'Tournament — Kraken Chronicles',
        'tournament_subtitle': 'Call of Dragons Tournament',
        'schedule_title': 'TOURNAMENT SCHEDULE (UTC)',
        'tournament_period': 'TOURNAMENT PERIOD:',
        'prize_pool': 'PRIZE POOL:',
        'group_stage': 'GROUP STAGE:',
        'playoffs': 'PLAYOFFS:',
        'grand_final': 'GRAND FINAL:',
        'next_match': 'Next match starts in:',
        'edit_schedule': 'Edit schedule',
        'save_schedule': 'Save schedule',
        'warning_utc': '⚠️ ALL DATES ARE IN UTC',
        'tournament_period_label': 'Tournament period (UTC)',
        'group_stage_label': 'Group stage (UTC)',
        'playoffs_label': 'Playoffs (UTC)',
        'grand_final_label': 'Grand final (UTC)',
        'prize_pool_label': 'Prize pool',
        'start': 'Start',
        'end': 'End',
        'draw_title': 'TEAM DRAW (2 groups of 4 teams)',
        'draw_info': 'Enter 8 team names below. Click buttons in order to distribute teams into groups.',
        'draw_group_a': 'Group A — 4 teams',
        'draw_group_b': 'Group B — 4 teams',
        'team': 'Team',
        'avatar_url': 'Avatar URL',
        'draw_to_group_a': 'To Group A (teams 1-2)',
        'draw_to_group_b': 'To Group B (teams 3-4)',
        'draw_to_group_a2': 'To Group A (teams 5-6)',
        'draw_to_group_b2': 'To Group B (teams 7-8)',
        'save_draw': 'Save draw',
        'clear_teams': 'Clear teams',
        'group_stage_title': 'GROUP STAGE',
        'group': 'GROUP',
        'everyone_with_everyone': 'round robin — 3 matches per team',
        'team_header': 'TEAM',
        'wins_header': 'WINS',
        'points_header': 'POINTS',
        'matches_header': 'GROUP MATCHES',
        'waiting_draw': 'waiting for draw',
        'placeholder_text': 'Teams will be distributed after the draw',
        'eliminated': 'eliminated',
        'playoffs_title': 'PLAYOFFS',
        'upper_bracket': 'UPPER BRACKET',
        'lower_bracket': 'LOWER BRACKET (LOSERS)',
        'lower_semi': 'SEMIFINAL',
        'lower_final': 'FINAL',
        'grand_final_title': 'GRAND FINAL',
        'winner_label': 'WINNER:',
        'champion': 'CHAMPION:',
        'results_title': 'TOURNAMENT RESULTS',
        'place_header': 'PLACE',
        'team_header_results': 'TEAM',
        'wins_header_results': 'WINS',
        'points_header_results': 'POINTS',
        'prize_header': 'PRIZE',
        'admin_title': 'Admin Access',
        'admin_password': 'Enter password',
        'admin_login': 'Login',
        'admin_edit_matches': 'Match Editor',
        'admin_prizes': 'PRIZES BY PLACE',
        'admin_place': 'PLACE',
        'admin_save_prizes': 'SAVE PRIZES',
        'admin_save_sheet': 'Save to Google Sheet',
        'admin_full_reset': 'Full Tournament Reset',
        'admin_save_avatars': 'Save Avatars',
        'admin_reset_draw': 'Reset Draw',
        'save': 'SAVE',
        'live': 'LIVE',
        'vs': 'VS',
        'date_not_set': 'Date not set',
        'on_air': 'ON AIR!',
        'rules_title': 'TOURNAMENT RULES',
        'add_section': '+ ADD SECTION',
        'save_rules': 'SAVE',
        'reset_rules': 'RESET',
        'loading': 'Loading rules...',
        'empty_rules': 'Rules not yet filled',
        'new_section': 'New Section',
        'empty_content': 'Content not filled',
        'status_saving': 'Saving...',
        'status_saved': 'Saved!',
        'status_error': 'Error:',
        'status_admin_required': 'Admin authorization required',
        'status_draw_completed': 'Draw completed!',
        'status_draw_not_completed': 'Draw not completed!',
        'status_cleared': 'All team names cleared',
        'status_full_reset': 'Full tournament reset...',
        'status_full_reset_done': 'Full reset completed!',
        'champion_text': 'CHAMPION',
        'confirm_clear_teams': 'Clear all team names?',
        'confirm_reset_draw': 'Reset draw? This will clear all team distribution. Continue?',
        'confirm_full_reset': 'FULL TOURNAMENT RESET\n\nThis will:\n- Delete all team names\n- Reset all scores and points\n- Clear winners\n- Reset schedule\n- Clear avatars\n- Show draw block\n\nContinue?',
        'confirm_delete_section': 'Delete this section?',
        'confirm_reset_rules': 'Reset rules to default?',
        'status_saving_avatars': 'Saving teams and avatars...',
        'status_avatars_saved': 'Teams and avatars saved!',
        'status_saving_prizes': 'Saving prizes...',
        'status_prizes_saved': 'Prizes saved!',
        'status_saving_schedule': 'Saving schedule...',
        'status_schedule_saved': 'Schedule saved!',
        'status_saving_draw': 'Saving draw...',
        'status_draw_saved': 'Draw saved!',
        'status_saving_tournament': 'Saving...',
        'status_tournament_saved': 'Saved!',
        'status_password_check': 'Checking password...',
        'status_admin_activated': 'Admin access activated',
        'status_wrong_password': 'Wrong password',
        'status_enter_password': 'Enter password',
        'status_auth_required': 'Please login as admin first',
        'status_draw_already_completed': 'Draw already completed!',
        'status_wrong_turn': 'Not your turn! Expected step',
        'status_team_not_filled': 'Team {num} is not filled!',
        'status_not_enough_teams': 'Not enough teams for draw',
        'status_draw_reset': 'Draw reset.',
        'status_exit_admin': 'Exiting admin mode',
        'admin_score': 'SCORE',
        'admin_points': 'POINTS',
        'admin_date': 'DATE',
        'admin_link': 'LINK',
        'admin_save': 'SAVE',
        'admin_score1': 'Score 1',
        'admin_score2': 'Score 2',
        'admin_points1': 'Points 1',
        'admin_points2': 'Points 2',
        'admin_live_url': 'LIVE URL',
        'admin_winner': 'WINNER:',
        'rules_empty_sections': 'No sections. Click "Add section".',
        'rules_load_error': 'Error loading rules',
        'rules_saving': 'Saving rules...',
        'rules_saved': 'Rules saved!',
        'rules_save_empty_error': 'Cannot save empty rules',
        'rules_resetting': 'Resetting rules...',
        'rules_reset_done': 'Rules reset to default!',
        'new_section_default': 'New Section',
        'new_content_default': 'New section content...',
        'admin_notification': '🔓 Admin panel unlocked. Enter password.',
        'draw_status_title': 'Group distribution:',
        'draw_group_a_label': 'Group A:',
        'draw_group_b_label': 'Group B:',
        'draw_teams_left': 'Teams left:',
        'draw_completed_message': 'Draw completed! Click "Save draw".',
        'draw_waiting_message': 'empty',
        'team_not_filled_error': 'Team {num} is not filled!',
        'group_added_success': 'Teams added to group {group}',
        'draw_completed_success': 'Draw completed!',
        'team_placeholder': 'Team name',
        'avatar_placeholder': 'Avatar URL',
        'prize_placeholder': 'Prize amount',
        'data_synced': 'Data synchronized with Google Sheets',
        'loading_rules': 'Loading rules...'
    }
};

let currentLang = 'ru';

function t(key) { return translations[currentLang][key] || key; }

// ==================== ФУНКЦИИ КЕШИРОВАНИЯ ====================
function shouldUseCache() {
    return !isAdmin;
}

function getCachedData() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const data = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION_USER;
        if (isExpired) return null;
        return data;
    } catch (e) { return null; }
}

function saveToCache(data) {
    const cacheData = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}

// ==================== ОБЪЕДИНЁННАЯ ЗАГРУЗКА ДАННЫХ ====================
async function loadAllData() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getAllData`);
        const data = await response.json();
        
        if (data.success) {
            // Распределяем данные
            if (data.schedule) {
                scheduleData = data.schedule;
                updateScheduleUI();
                checkPastDates();
            }
            if (data.tournament) {
                tournamentData = data.tournament;
            }
            if (data.prizes) {
                prizeData = data.prizes;
                for (let i = 1; i <= 8; i++) {
                    const input = document.getElementById(`prize-${i}`);
                    if (input && prizeData[i]) input.value = prizeData[i];
                }
            }
            if (data.avatars) {
                window.teamAvatars = data.avatars;
            }
            if (data.drawStatus !== undefined) {
                updateDrawSectionVisibility();
            }
            
            // Обновляем UI
            if (!isAdmin) saveToCache(data);
            
            renderGroups();
            renderPlayoffs();
            renderResults();
            updateDrawStatus();
            updateDrawButtons();
            updatePlayoffsBracket();
            updateDrawSectionVisibility();
            updateGroupStageAnimation();
            checkPastDates();
            startCountdownTimer();
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('loadAllData error:', error);
        return false;
    }
}

async function loadAllDataWithCache() {
    if (!shouldUseCache()) {
        console.log('Админ режим: загружаем свежие данные');
        await loadAllData();
        checkPastDates();
        return;
    }
    
    const cached = getCachedData();
    if (cached) {
        console.log('Зритель: данные из кеша');
        const data = cached.data;
        if (data.schedule) {
            scheduleData = data.schedule;
            updateScheduleUI();
            checkPastDates();
        }
        if (data.tournament) tournamentData = data.tournament;
        if (data.prizes) prizeData = data.prizes;
        if (data.avatars) window.teamAvatars = data.avatars;
        
        renderGroups();
        renderPlayoffs();
        renderResults();
        updateDrawStatus();
        updateDrawButtons();
        updatePlayoffsBracket();
        updateDrawSectionVisibility();
        updateGroupStageAnimation();
        startCountdownTimer();
        return true;
    }
    
    console.log('Зритель: кеша нет, загружаем с сервера');
    await loadAllData();
    checkPastDates();
    return true;
}

function updateScheduleUI() {
    // Функция для преобразования даты из любого формата в ДД.ММ.ГГГГ
    function formatDateForDisplay(dateStr) {
        if (!dateStr || dateStr === '—') return '—';
        
        // Если уже в формате ДД.ММ.ГГГГ
        const rusFormat = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
        if (rusFormat) {
            return `${rusFormat[1]}.${rusFormat[2]}.${rusFormat[3]}`;
        }
        
        // Если в формате YYYY-MM-DD или YYYY-MM-DDTHH:MM
        let cleanStr = String(dateStr);
        if (cleanStr.startsWith("'")) {
            cleanStr = cleanStr.substring(1);
        }
        
        const isoMatch = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const [_, year, month, day] = isoMatch;
            return `${day}.${month}.${year}`;
        }
        
        return dateStr;
    }
    
    function formatDateTimeForDisplay(dateStr) {
        if (!dateStr || dateStr === '—') return '—';
        
        // Если уже в формате ДД.ММ.ГГГГ ЧЧ:ММ
        const rusFullMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
        if (rusFullMatch) {
            return `${rusFullMatch[1]}.${rusFullMatch[2]}.${rusFullMatch[3]} ${rusFullMatch[4]}:${rusFullMatch[5]}`;
        }
        
        // Если в формате YYYY-MM-DDTHH:MM
        let cleanStr = String(dateStr);
        if (cleanStr.startsWith("'")) {
            cleanStr = cleanStr.substring(1);
        }
        
        const isoMatch = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (isoMatch) {
            const [_, year, month, day, hours, minutes] = isoMatch;
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        }
        
        // Если только дата без времени
        const dateOnlyMatch = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateOnlyMatch) {
            const [_, year, month, day] = dateOnlyMatch;
            return `${day}.${month}.${year}`;
        }
        
        return dateStr;
    }
    
    const periodStartEl = document.getElementById('tournament-period-start');
    const periodEndEl = document.getElementById('tournament-period-end');
    const qfStartEl = document.getElementById('qf-period-start');
    const qfEndEl = document.getElementById('qf-period-end');
    const sfStartEl = document.getElementById('sf-period-start');
    const sfEndEl = document.getElementById('sf-period-end');
    const finalEl = document.getElementById('final-datetime');
    const prizeEl = document.getElementById('prize-pool');
    
    if (periodStartEl) periodStartEl.textContent = formatDateForDisplay(scheduleData.periodStart);
    if (periodEndEl) periodEndEl.textContent = formatDateForDisplay(scheduleData.periodEnd);
    if (qfStartEl) qfStartEl.textContent = formatDateForDisplay(scheduleData.qfStart);
    if (qfEndEl) qfEndEl.textContent = formatDateForDisplay(scheduleData.qfEnd);
    if (sfStartEl) sfStartEl.textContent = formatDateForDisplay(scheduleData.sfStart);
    if (sfEndEl) sfEndEl.textContent = formatDateForDisplay(scheduleData.sfEnd);
    if (finalEl) finalEl.textContent = formatDateTimeForDisplay(scheduleData.final);
    if (prizeEl) prizeEl.textContent = scheduleData.prizePool || '—';
}

// ==================== ЗАГРУЗКА РАСПИСАНИЯ (через API_KEY) ====================
async function loadSchedule() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Schedule!A2:C20?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.values && data.values.length > 0) {
            for (let row of data.values) {
                const eventName = row[0];
                let startValue = row[1] || '—';
                let endValue = row[2] || '—';
                startValue = startValue.toString().trim();
                endValue = endValue.toString().trim();
                
                function parseDateFromSheet(value) {
                    if (!value || value === '—') return '';
                    let cleanValue = String(value);
                    if (cleanValue.startsWith("'")) cleanValue = cleanValue.substring(1);
                    const isoMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
                    if (isoMatch) return cleanValue;
                    const dateOnlyMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (dateOnlyMatch) return cleanValue + 'T00:00';
                    const match = cleanValue.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
                    if (match) {
                        const [_, day, month, year, hours = '00', minutes = '00'] = match;
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                    }
                    return '';
                }
                
                function formatDisplay(value) {
                    if (!value || value === '—') return '—';
                    const converted = parseDateFromSheet(value);
                    if (converted && converted.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
                        const [datePart, timePart] = converted.split('T');
                        const [year, month, day] = datePart.split('-');
                        const [hours, minutes] = timePart.split(':');
                        if (hours === '00' && minutes === '00') return `${day}.${month}.${year}`;
                        return `${day}.${month}.${year} ${hours}:${minutes}`;
                    }
                    return value;
                }
                
                if (eventName === 'Период турнира') {
                    const parsedStart = parseDateFromSheet(startValue);
                    const parsedEnd = parseDateFromSheet(endValue);
                    document.getElementById('tournament-period-start').textContent = formatDisplay(startValue);
                    document.getElementById('tournament-period-end').textContent = formatDisplay(endValue);
                    scheduleData.periodStart = parsedStart;
                    scheduleData.periodEnd = parsedEnd;
                } else if (eventName === 'Групповой этап') {
                    const parsedStart = parseDateFromSheet(startValue);
                    const parsedEnd = parseDateFromSheet(endValue);
                    document.getElementById('qf-period-start').textContent = formatDisplay(startValue);
                    document.getElementById('qf-period-end').textContent = formatDisplay(endValue);
                    scheduleData.qfStart = parsedStart;
                    scheduleData.qfEnd = parsedEnd;
                } else if (eventName === 'Плей-офф') {
                    const parsedStart = parseDateFromSheet(startValue);
                    const parsedEnd = parseDateFromSheet(endValue);
                    document.getElementById('sf-period-start').textContent = formatDisplay(startValue);
                    document.getElementById('sf-period-end').textContent = formatDisplay(endValue);
                    scheduleData.sfStart = parsedStart;
                    scheduleData.sfEnd = parsedEnd;
                } else if (eventName === 'Гранд-финал') {
                    const parsedStart = parseDateFromSheet(startValue);
                    document.getElementById('final-datetime').textContent = formatDisplay(startValue);
                    scheduleData.final = parsedStart;
                } else if (eventName === 'Призовой фонд') {
                    document.getElementById('prize-pool').textContent = startValue;
                    scheduleData.prizePool = startValue;
                }
            }
        }
        
        checkPastDates();
        startCountdownTimer();
        updateGroupStageAnimation();
    } catch (e) { console.log('Schedule load error:', e); }
}

// ==================== ФУНКЦИИ ПЕРЕВОДА ====================
function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tournament_lang', lang);
    
    const langBtn = document.getElementById('lang-switch-btn');
    if (langBtn) langBtn.textContent = lang === 'ru' ? 'EN' : 'RU';
    
    updateAllTexts();
    // НЕ НУЖНО перезагружать данные - просто перерисовываем из существующих
    renderGroups();
    renderPlayoffs();
    renderResults();
    updateDrawStatus();
    
    playSound('click');
}

function updateAllTexts() {
    // Шапка
    const titleEl = document.querySelector('header h1');
    if (titleEl) titleEl.textContent = t('tournament_title');
    
    const subtitleEl = document.querySelector('header p');
    if (subtitleEl) subtitleEl.textContent = t('tournament_subtitle');
    
    // Расписание
    const scheduleTitle = document.querySelector('.schedule-section h2');
    if (scheduleTitle) scheduleTitle.textContent = t('schedule_title');
    
    const tournamentPeriodLabel = document.querySelector('.schedule-period .schedule-label-bold');
    if (tournamentPeriodLabel) tournamentPeriodLabel.textContent = t('tournament_period');
    
    const prizePoolLabel = document.querySelector('.schedule-period .schedule-label-bold:last-child');
    if (prizePoolLabel && prizePoolLabel.textContent.includes('ПРИЗОВОЙ')) {
        prizePoolLabel.textContent = t('prize_pool');
    }
    
    const groupStageTitle = document.querySelector('.groups-section h2');
    if (groupStageTitle) groupStageTitle.textContent = t('group_stage_title');
    
    const playoffsTitle = document.querySelector('.playoffs-section h2');
    if (playoffsTitle) playoffsTitle.textContent = t('playoffs_title');
    
    const upperBracketTitle = document.querySelector('.upper-bracket h3');
    if (upperBracketTitle) upperBracketTitle.textContent = t('upper_bracket');
    
    const lowerBracketTitle = document.querySelector('.lower-bracket h3');
    if (lowerBracketTitle) lowerBracketTitle.textContent = t('lower_bracket');
    
    const grandFinalTitle = document.querySelector('.final-bracket h3');
    if (grandFinalTitle) grandFinalTitle.textContent = t('grand_final_title');
    
    const lowerSemiLabel = document.querySelector('.lower-bracket .match-label');
    if (lowerSemiLabel && lowerSemiLabel.textContent === 'ПОЛУФИНАЛ') {
        lowerSemiLabel.textContent = t('lower_semi');
    }
    
    const lowerFinalLabel = document.querySelectorAll('.lower-bracket .match-label')[1];
    if (lowerFinalLabel && lowerFinalLabel.textContent === 'ФИНАЛ') {
        lowerFinalLabel.textContent = t('lower_final');
    }
    
    const resultsTitle = document.querySelector('.results-section h2');
    if (resultsTitle) resultsTitle.textContent = t('results_title');
    
    const resultsHeaders = document.querySelectorAll('.results-header div');
    if (resultsHeaders.length >= 5) {
        resultsHeaders[0].textContent = t('place_header');
        resultsHeaders[1].textContent = t('team_header_results');
        resultsHeaders[2].textContent = t('wins_header_results');
        resultsHeaders[3].textContent = t('points_header_results');
        resultsHeaders[4].textContent = t('prize_header');
    }
    
    const drawTitle = document.querySelector('.draw-section h2');
    if (drawTitle) drawTitle.textContent = t('draw_title');
    
    const drawInfo = document.querySelector('.draw-info');
    if (drawInfo) {
        const pElements = drawInfo.querySelectorAll('p');
        if (pElements[0]) pElements[0].textContent = t('draw_info');
        if (pElements[1]) pElements[1].innerHTML = `<strong>${t('draw_group_a')}</strong> | <strong>${t('draw_group_b')}</strong>`;
    }
    
    const drawBtnA1 = document.getElementById('draw-group-a1');
    if (drawBtnA1) drawBtnA1.textContent = t('draw_to_group_a');
    
    const drawBtnB1 = document.getElementById('draw-group-b1');
    if (drawBtnB1) drawBtnB1.textContent = t('draw_to_group_b');
    
    const drawBtnA2 = document.getElementById('draw-group-a2');
    if (drawBtnA2) drawBtnA2.textContent = t('draw_to_group_a2');
    
    const drawBtnB2 = document.getElementById('draw-group-b2');
    if (drawBtnB2) drawBtnB2.textContent = t('draw_to_group_b2');
    
    const saveDrawBtn = document.getElementById('save-draw');
    if (saveDrawBtn) saveDrawBtn.textContent = t('save_draw');
    
    const clearTeamsBtn = document.getElementById('clear-teams');
    if (clearTeamsBtn) clearTeamsBtn.textContent = t('clear_teams');
    
    const adminTitle = document.querySelector('#admin-panel h2');
    if (adminTitle) adminTitle.textContent = t('admin_title');
    
    const adminPassPlaceholder = document.getElementById('admin-pass');
    if (adminPassPlaceholder) adminPassPlaceholder.placeholder = t('admin_password');
    
    const adminLoginBtn = document.getElementById('unlock-admin');
    if (adminLoginBtn) adminLoginBtn.textContent = t('admin_login');
    
    const adminEditTitle = document.querySelector('#admin-controls h3');
    if (adminEditTitle) adminEditTitle.textContent = t('admin_edit_matches');
    
    const adminPrizesTitle = document.querySelector('#admin-controls .prize-section h3');
    if (adminPrizesTitle) adminPrizesTitle.textContent = t('admin_prizes');
    
    const savePrizesBtn = document.getElementById('save-prizes');
    if (savePrizesBtn) savePrizesBtn.textContent = t('admin_save_prizes');
    
    const saveChangesBtn = document.getElementById('save-changes');
    if (saveChangesBtn) saveChangesBtn.textContent = t('admin_save_sheet');
    
    const fullResetBtn = document.getElementById('full-reset-btn');
    if (fullResetBtn) fullResetBtn.textContent = t('admin_full_reset');
    
    const saveAvatarsBtn = document.getElementById('save-avatars');
    if (saveAvatarsBtn) saveAvatarsBtn.textContent = t('admin_save_avatars');
    
    const resetDrawBtn = document.getElementById('reset-draw-btn');
    if (resetDrawBtn) resetDrawBtn.textContent = t('admin_reset_draw');
    
    const editScheduleBtn = document.getElementById('edit-schedule-btn');
    if (editScheduleBtn) editScheduleBtn.textContent = t('edit_schedule');
    
    const saveScheduleBtn = document.getElementById('save-schedule');
    if (saveScheduleBtn) saveScheduleBtn.textContent = t('save_schedule');
    
    const warningLabel = document.querySelector('#schedule-editor .schedule-edit-grid ~ div span');
    if (warningLabel) warningLabel.textContent = t('warning_utc');
    
    const periodLabel = document.querySelector('.edit-group label');
    if (periodLabel && periodLabel.textContent === 'Период турнира (UTC)') {
        const labels = document.querySelectorAll('.edit-group label');
        if (labels[0]) labels[0].textContent = t('tournament_period_label');
        if (labels[1]) labels[1].textContent = t('group_stage_label');
        if (labels[2]) labels[2].textContent = t('playoffs_label');
        if (labels[3]) labels[3].textContent = t('grand_final_label');
        if (labels[4]) labels[4].textContent = t('prize_pool_label');
    }
    
    const rulesModalTitle = document.querySelector('.rules-modal-header h2');
    if (rulesModalTitle) rulesModalTitle.textContent = t('rules_title');
    
    const addRulesBtn = document.getElementById('add-rules-section');
    if (addRulesBtn) addRulesBtn.textContent = t('add_section');
    
    const saveRulesBtn = document.getElementById('save-rules');
    if (saveRulesBtn) saveRulesBtn.textContent = t('save_rules');
    
    const resetRulesBtn = document.getElementById('reset-rules');
    if (resetRulesBtn) resetRulesBtn.textContent = t('reset_rules');
    
    updateTimerText();
    
    // Обновляем плейсхолдеры
    for (let i = 1; i <= 8; i++) {
        const teamInput = document.getElementById(`team${i}`);
        const avatarInput = document.getElementById(`team${i}_avatar`);
        if (teamInput) teamInput.placeholder = t('team_placeholder');
        if (avatarInput) avatarInput.placeholder = t('avatar_placeholder');
    }
    
    for (let i = 1; i <= 8; i++) {
        const prizeInput = document.getElementById(`prize-${i}`);
        if (prizeInput) prizeInput.placeholder = t('prize_placeholder');
    }
    
    const footerText = document.querySelector('footer p');
    if (footerText) {
        footerText.innerHTML = t('data_synced') + ' <button id="force-refresh" class="refresh-btn">↻</button>';
    }

    // Обновляем расписание (schedule)
    const groupStageLabel = document.querySelector('.match-schedule-item .schedule-label-bold');
    if (groupStageLabel && groupStageLabel.textContent.includes('ГРУППОВОЙ ЭТАП')) {
        const labels = document.querySelectorAll('.match-schedule-item .schedule-label-bold');
        if (labels[0]) labels[0].textContent = t('group_stage');
        if (labels[1]) labels[1].textContent = t('playoffs');
        if (labels[2]) labels[2].textContent = t('grand_final');
    }

    // Обновляем заголовок "ПРИЗОВОЙ ФОНД:" в расписании - более надёжный способ
    const allScheduleLabels = document.querySelectorAll('.schedule-period .schedule-label-bold');
    for (let i = 0; i < allScheduleLabels.length; i++) {
        const label = allScheduleLabels[i];
        if (label && label.textContent.includes('ПРИЗОВОЙ')) {
            label.textContent = t('prize_pool');
            break;
        }
    }

    // Также обновляем заголовок "ПРИЗОВОЙ ФОНД:" в админ-панели (если есть)
    const adminPrizeHeader = document.querySelector('#admin-controls .prize-section h3');
    if (adminPrizeHeader && adminPrizeHeader.textContent.includes('ПРИЗОВОЙ')) {
        adminPrizeHeader.textContent = t('admin_prizes');
    }
    
    // Принудительно обновляем HTML lang атрибут
    document.documentElement.lang = currentLang === 'ru' ? 'ru' : 'en';
}

function updateTimerText() {
    const timerLabel = document.querySelector('.countdown-timer .schedule-label-bold');
    if (timerLabel) timerLabel.textContent = t('next_match');
}

// Переопределяем formatDateDisplay для перевода "Дата не назначена"
const originalFormatDateDisplay = formatDateDisplay;
window.formatDateDisplay = function(dateStr) {
    if (!dateStr) return t('date_not_set');
    return originalFormatDateDisplay(dateStr);
};

// ==================== ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ В МАТЧАХ ====================

function trackMatchChanges(group, matchId) {
    const score1Input = document.getElementById(`${group}_score1_${matchId}`);
    const score2Input = document.getElementById(`${group}_score2_${matchId}`);
    const points1Input = document.getElementById(`${group}_points1_${matchId}`);
    const points2Input = document.getElementById(`${group}_points2_${matchId}`);
    const dateInput = document.getElementById(`${group}_date_${matchId}`);
    const streamUrlInput = document.getElementById(`${group}_streamUrl_${matchId}`);
    const updateBtn = document.querySelector(`.match-update-btn[data-group="${group}"][data-match-id="${matchId}"]`);
    
    if (!updateBtn) {
        console.warn(`Кнопка не найдена для группы ${group}, матч ${matchId}`);
        return;
    }
    
    function checkChanges() {
        const matches = tournamentData.groups[group].matches;
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        
        const hasChanges = 
            (parseInt(score1Input?.value) || 0) !== match.score1 ||
            (parseInt(score2Input?.value) || 0) !== match.score2 ||
            (parseInt(points1Input?.value) || 0) !== match.points1 ||
            (parseInt(points2Input?.value) || 0) !== match.points2 ||
            (dateInput?.value || '') !== (match.date ? formatDateForInput(match.date) : '') ||
            (streamUrlInput?.value || '') !== (match.streamUrl || '');
        
        if (hasChanges) {
            updateBtn.classList.add('has-changes');
        } else {
            updateBtn.classList.remove('has-changes');
        }
    }
    
    if (score1Input) score1Input.addEventListener('input', checkChanges);
    if (score2Input) score2Input.addEventListener('input', checkChanges);
    if (points1Input) points1Input.addEventListener('input', checkChanges);
    if (points2Input) points2Input.addEventListener('input', checkChanges);
    if (dateInput) dateInput.addEventListener('change', checkChanges);
    if (streamUrlInput) streamUrlInput.addEventListener('input', checkChanges);
    
    checkChanges();
}

function trackPlayoffChanges(matchId) {
    const score1Input = document.getElementById(`${matchId}_score1`);
    const score2Input = document.getElementById(`${matchId}_score2`);
    const points1Input = document.getElementById(`${matchId}_points1`);
    const points2Input = document.getElementById(`${matchId}_points2`);
    const dateInput = document.getElementById(`${matchId}_date`);
    const streamUrlInput = document.getElementById(`${matchId}_streamUrl`);
    const updateBtn = document.getElementById(`update-${matchId}`);
    
    if (!updateBtn) return;
    
    function checkChanges() {
        const match = tournamentData.playoffs[matchId];
        if (!match) return;
        
        const hasChanges = 
            (parseInt(score1Input?.value) || 0) !== (match.team1Score || 0) ||
            (parseInt(score2Input?.value) || 0) !== (match.team2Score || 0) ||
            (parseInt(points1Input?.value) || 0) !== (match.team1Points || 0) ||
            (parseInt(points2Input?.value) || 0) !== (match.team2Points || 0) ||
            (dateInput?.value || '') !== (match.date ? formatDateForInput(match.date) : '') ||
            (streamUrlInput?.value || '') !== (match.streamUrl || '');
        
        if (hasChanges) {
            updateBtn.classList.add('has-changes');
        } else {
            updateBtn.classList.remove('has-changes');
        }
    }
    
    if (score1Input) score1Input.addEventListener('input', checkChanges);
    if (score2Input) score2Input.addEventListener('input', checkChanges);
    if (points1Input) points1Input.addEventListener('input', checkChanges);
    if (points2Input) points2Input.addEventListener('input', checkChanges);
    if (dateInput) dateInput.addEventListener('change', checkChanges);
    if (streamUrlInput) streamUrlInput.addEventListener('input', checkChanges);
    
    checkChanges();
}

// ==================== ЗВУКИ ====================
let soundEnabled = true;
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') audioContext.resume();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    try {
        initAudio();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        if (type === 'click') { osc.frequency.value = 180; gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15); osc.start(now); osc.stop(now + 0.15); }
        else if (type === 'success') { osc.frequency.value = 120; gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4); osc.start(now); osc.stop(now + 0.4); }
        else if (type === 'error') { osc.frequency.value = 100; osc.type = 'sawtooth'; gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3); osc.start(now); osc.stop(now + 0.3); }
        else if (type === 'draw') { osc.frequency.value = 140; gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0.2, now + 0.1); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5); osc.start(now); osc.stop(now + 0.5); }
    } catch(e) { console.log('Sound error:', e); }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    str = String(str);
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function getAvatarHtml(teamName) {
    if (!teamName || teamName === 'TBD' || teamName === '') return '';
    const avatarUrl = window.teamAvatars ? window.teamAvatars[teamName] : '';
    if (!avatarUrl) {
        return `<img src="" class="team-avatar" alt="${escapeHtml(teamName)}" style="visibility: hidden;">`;
    }
    return `<img src="${avatarUrl}" class="team-avatar" alt="${escapeHtml(teamName)}" onerror="this.style.display='none'">`;
}

async function saveAvatarsToSheet() {
    if (!isAdmin) {
        showStatus('status_admin_required', 'error');
        playSound('error');
        return;
    }
    
    const avatarsData = {};
    for (let i = 1; i <= 8; i++) {
        const nameInput = document.getElementById(`team${i}`);
        const avatarInput = document.getElementById(`team${i}_avatar`);
        if (nameInput && nameInput.value.trim()) {
            avatarsData[i] = {
                name: nameInput.value.trim(),
                avatar: avatarInput ? avatarInput.value.trim() : ''
            };
        }
    }
    
    showStatus('status_saving_avatars', 'success');
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'saveAvatars',
                data: JSON.stringify(avatarsData)
            }).toString()
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.teamAvatars = {};
            for (let i = 1; i <= 8; i++) {
                const name = avatarsData[i]?.name;
                const avatar = avatarsData[i]?.avatar;
                if (name && avatar) {
                    window.teamAvatars[name] = avatar;
                }
            }
            playSound('success');
            showStatus('status_avatars_saved', 'success');
            renderGroups();
            renderPlayoffs();
        } else {
            showStatus('status_error', 'error');
            playSound('error');
        }
    } catch(e) {
        console.error('Save avatars error:', e);
        playSound('error');
        showStatus('status_error', 'error');
    }
}

function showStatus(msgKey, type) {
    const d = document.getElementById('sync-status');
    if (!d) return;
    const msg = t(msgKey);
    d.innerHTML = `<div class="status-${type}">${msg}</div>`;
    setTimeout(() => { if (d.innerHTML.includes(msg)) d.innerHTML = ''; }, 3000);
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function addDrawAnimation(element) {
    if (!element) return;
    element.classList.add('draw-animation');
    setTimeout(() => element.classList.remove('draw-animation'), 400);
}

// ==================== ФОРМАТИРОВАНИЕ ДАТ ДЛЯ UTC ====================
function formatDateOnly(dateTimeStr) {
    if (!dateTimeStr) return '—';
    const match = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
        const [_, year, month, day] = match;
        return `${day}.${month}.${year}`;
    }
    return dateTimeStr;
}

function formatDateTimeFull(dateTimeStr) {
    if (!dateTimeStr) return '—';
    const match = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
        const [_, year, month, day, hours, minutes] = match;
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    return dateTimeStr;
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return t('date_not_set');
    const [datePart, timePart] = dateStr.split('T');
    if (!datePart || !timePart) return dateStr;
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if (match) {
        return `${match[1]}T${match[2]}`;
    }
    return '';
}

function formatUTCDisplay(dateTimeStr) {
    if (!dateTimeStr) return '—';
    return formatDateTimeFull(dateTimeStr);
}

// ==================== ПРОВЕРКА ЗАВЕРШЕНИЯ ГРУППОВОГО ЭТАПА ====================
function isGroupStageCompleted(group) {
    const matches = tournamentData.groups[group].matches || [];
    if (matches.length === 0) return false;
    const allMatchesCompleted = matches.every(match => match.winner && match.winner !== '');
    return allMatchesCompleted;
}

function areBothGroupsCompleted() {
    return isGroupStageCompleted('A') && isGroupStageCompleted('B');
}

// ==================== ПРИЗОВОЙ ФОНД ====================
async function loadPrizes() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getPrizes`);
        const data = await response.json();
        if (data && data.prizes) {
            prizeData = data.prizes;
            for (let i = 1; i <= 8; i++) {
                const input = document.getElementById(`prize-${i}`);
                if (input && prizeData[i]) {
                    input.value = prizeData[i];
                }
            }
        }
    } catch (error) {
        console.log('loadPrizes error:', error);
    }
}

async function loadTeamsAndAvatarsFromSheet() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getTeamsList`);
        const data = await response.json();
        
        if (data.success && data.teams && data.teams.length > 0) {
            const teams = data.teams;
            console.log('Загружены команды с аватарами:', teams);
            
            for (let i = 0; i < Math.min(teams.length, 8); i++) {
                const nameInput = document.getElementById(`team${i + 1}`);
                const avatarInput = document.getElementById(`team${i + 1}_avatar`);
                
                if (nameInput) {
                    nameInput.value = teams[i].name;
                }
                if (avatarInput && teams[i].avatar) {
                    avatarInput.value = teams[i].avatar;
                }
            }
            
            window.teamAvatars = {};
            for (let i = 0; i < teams.length; i++) {
                if (teams[i].name && teams[i].avatar) {
                    window.teamAvatars[teams[i].name] = teams[i].avatar;
                }
            }
            
            console.log('Названия команд и аватары загружены в поля');
            return true;
        } else {
            console.log('Нет сохранённых команд в таблице TeamAvatars');
            return false;
        }
    } catch (error) {
        console.error('loadTeamsAndAvatarsFromSheet error:', error);
        return false;
    }
}

async function savePrizes() {
    if (!isAdmin) {
        showStatus('status_admin_required', 'error');
        playSound('error');
        return;
    }
    
    const newPrizeData = {};
    for (let i = 1; i <= 8; i++) {
        const input = document.getElementById(`prize-${i}`);
        if (input) {
            newPrizeData[i] = input.value.trim();
        }
    }
    
    showStatus('status_saving_prizes', 'success');
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'prizes',
                data: JSON.stringify(newPrizeData)
            }).toString()
        });
        
        const result = await response.json();
        console.log('Prizes save result:', result);
        
        if (result.success) {
            prizeData = newPrizeData;
            playSound('success');
            showStatus('status_prizes_saved', 'success');
            renderResults();
            saveOriginalPrizes();
            updatePrizesButtonColor();
        } else {
            showStatus('status_error', 'error');
            playSound('error');
        }
    } catch(e) {
        console.error('Save prizes error:', e);
        playSound('error');
        showStatus('status_error', 'error');
    }
}

// ==================== ЗАГРУЗКА ДАННЫХ ====================
async function loadSchedule() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Schedule!A2:C20?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.values && data.values.length > 0) {
            for (let row of data.values) {
                const eventName = row[0];
                let startValue = row[1] || '—';
                let endValue = row[2] || '—';
                startValue = startValue.toString().trim();
                endValue = endValue.toString().trim();
                
                function parseDateFromSheet(value) {
                    if (!value || value === '—') return '';
                    let cleanValue = String(value);
                    if (cleanValue.startsWith("'")) {
                        cleanValue = cleanValue.substring(1);
                    }
                    const isoMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
                    if (isoMatch) {
                        return cleanValue;
                    }
                    const dateOnlyMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
                    if (dateOnlyMatch) {
                        return cleanValue + 'T00:00';
                    }
                    const match = cleanValue.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
                    if (match) {
                        const [_, day, month, year, hours = '00', minutes = '00'] = match;
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                    }
                    return '';
                }
                
                function formatDisplay(value) {
                    if (!value || value === '—') return '—';
                    const converted = parseDateFromSheet(value);
                    if (converted && converted.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
                        const [datePart, timePart] = converted.split('T');
                        const [year, month, day] = datePart.split('-');
                        const [hours, minutes] = timePart.split(':');
                        if (hours === '00' && minutes === '00') {
                            return `${day}.${month}.${year}`;
                        }
                        return `${day}.${month}.${year} ${hours}:${minutes}`;
                    }
                    return value;
                }
                
                if (eventName === 'Период турнира') {
                    const parsedStart = parseDateFromSheet(startValue);
                    const parsedEnd = parseDateFromSheet(endValue);
                    document.getElementById('tournament-period-start').textContent = formatDisplay(startValue);
                    document.getElementById('tournament-period-end').textContent = formatDisplay(endValue);
                    scheduleData.periodStart = parsedStart;
                    scheduleData.periodEnd = parsedEnd;
                } else if (eventName === 'Групповой этап') {
                    const parsedStart = parseDateFromSheet(startValue);
                    const parsedEnd = parseDateFromSheet(endValue);
                    document.getElementById('qf-period-start').textContent = formatDisplay(startValue);
                    document.getElementById('qf-period-end').textContent = formatDisplay(endValue);
                    scheduleData.qfStart = parsedStart;
                    scheduleData.qfEnd = parsedEnd;
                } else if (eventName === 'Плей-офф') {
                    const parsedStart = parseDateFromSheet(startValue);
                    const parsedEnd = parseDateFromSheet(endValue);
                    document.getElementById('sf-period-start').textContent = formatDisplay(startValue);
                    document.getElementById('sf-period-end').textContent = formatDisplay(endValue);
                    scheduleData.sfStart = parsedStart;
                    scheduleData.sfEnd = parsedEnd;
                } else if (eventName === 'Гранд-финал') {
                    const parsedStart = parseDateFromSheet(startValue);
                    document.getElementById('final-datetime').textContent = formatDisplay(startValue);
                    scheduleData.final = parsedStart;
                } else if (eventName === 'Призовой фонд') {
                    document.getElementById('prize-pool').textContent = startValue;
                    scheduleData.prizePool = startValue;
                }
            }
        }
        
        console.log('Schedule data after conversion:', {
            periodStart: scheduleData.periodStart,
            periodEnd: scheduleData.periodEnd,
            qfStart: scheduleData.qfStart,
            qfEnd: scheduleData.qfEnd,
            sfStart: scheduleData.sfStart,
            sfEnd: scheduleData.sfEnd,
            final: scheduleData.final
        });
        
        checkPastDates();
        startCountdownTimer();
        updateGroupStageAnimation();
    } catch (e) { console.log('Schedule load error:', e); }
}

function checkPastDates() {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    ));

    function parseDateToUTC(dateStr) {
        if (!dateStr || dateStr === '—') return null;
        
        let cleanStr = String(dateStr);
        if (cleanStr.startsWith("'")) {
            cleanStr = cleanStr.substring(1);
        }
        
        // Формат: YYYY-MM-DD (без времени)
        const dateOnlyMatch = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateOnlyMatch) {
            const [_, year, month, day] = dateOnlyMatch;
            const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0));
            return isNaN(d.getTime()) ? null : d;
        }
        
        // Формат: YYYY-MM-DDTHH:MM
        const isoMatch = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (isoMatch) {
            const [_, year, month, day, hours, minutes] = isoMatch;
            const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes)));
            return isNaN(d.getTime()) ? null : d;
        }
        
        // Формат: DD.MM.YYYY (отображаемый)
        const rusMatch = cleanStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (rusMatch) {
            const [_, day, month, year] = rusMatch;
            const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0));
            return isNaN(d.getTime()) ? null : d;
        }
        
        // Формат: DD.MM.YYYY HH:MM
        const rusFullMatch = cleanStr.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
        if (rusFullMatch) {
            const [_, day, month, year, hours, minutes] = rusFullMatch;
            const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes)));
            return isNaN(d.getTime()) ? null : d;
        }
        
        return null;
    }

    function checkElement(elementId, dateValue, isEndDate = false, startDateValue = null) {
        const element = document.getElementById(elementId);
        if (!element) return;
        element.classList.remove('past', 'past-start');
        if (!dateValue || dateValue === '—') return;
        
        const dateToCheck = parseDateToUTC(dateValue);
        if (!dateToCheck) return;
        
        const checkDateOnly = new Date(Date.UTC(
            dateToCheck.getUTCFullYear(),
            dateToCheck.getUTCMonth(),
            dateToCheck.getUTCDate()
        ));
        
        if (isEndDate) {
            if (checkDateOnly < todayUTC) {
                element.classList.add('past');
            }
        } else {
            let isStageCompleted = false;
            if (startDateValue && startDateValue !== '—') {
                const endDate = parseDateToUTC(startDateValue);
                if (endDate) {
                    const endDateOnly = new Date(Date.UTC(
                        endDate.getUTCFullYear(),
                        endDate.getUTCMonth(),
                        endDate.getUTCDate()
                    ));
                    isStageCompleted = endDateOnly < todayUTC;
                }
            }
            if (isStageCompleted) {
                element.classList.add('past');
            } else if (checkDateOnly < todayUTC) {
                element.classList.add('past-start');
            }
        }
    }

    checkElement('tournament-period-start', scheduleData.periodStart, false, scheduleData.periodEnd);
    checkElement('tournament-period-end', scheduleData.periodEnd, true);
    checkElement('qf-period-start', scheduleData.qfStart, false, scheduleData.qfEnd);
    checkElement('qf-period-end', scheduleData.qfEnd, true);
    checkElement('sf-period-start', scheduleData.sfStart, false, scheduleData.sfEnd);
    checkElement('sf-period-end', scheduleData.sfEnd, true);
    checkElement('final-datetime', scheduleData.final, true);
}

function fillScheduleEditor() {
    document.getElementById('edit-period-start').value = scheduleData.periodStart || '';
    document.getElementById('edit-period-end').value = scheduleData.periodEnd || '';
    document.getElementById('edit-qf-start').value = scheduleData.qfStart || '';
    document.getElementById('edit-qf-end').value = scheduleData.qfEnd || '';
    document.getElementById('edit-sf-start').value = scheduleData.sfStart || '';
    document.getElementById('edit-sf-end').value = scheduleData.sfEnd || '';
    document.getElementById('edit-final').value = scheduleData.final || '';
    document.getElementById('edit-prize-pool').value = scheduleData.prizePool || '';
    
    saveOriginalSchedule();
    updateScheduleButtonColor();
}

function updateGroupStageAnimation() {
    console.log('=== updateGroupStageAnimation вызван ===');
    
    const groupAHeader = document.getElementById('group-A-matches-header');
    const groupBHeader = document.getElementById('group-B-matches-header');
    
    if (!groupAHeader || !groupBHeader) {
        console.log('updateGroupStageAnimation: заголовки групп не найдены в DOM');
        return;
    }
    
    const isGroupACompleted = isGroupStageCompleted('A');
    const isGroupBCompleted = isGroupStageCompleted('B');
    
    console.log('Группа A завершена:', isGroupACompleted);
    console.log('Группа B завершена:', isGroupBCompleted);
    
    if (!isGroupACompleted) {
        groupAHeader.classList.add('active');
        console.log('🎬 Группа A: анимация ВКЛЮЧЕНА');
    } else {
        groupAHeader.classList.remove('active');
        console.log('⏸ Группа A: анимация ВЫКЛЮЧЕНА');
    }
    
    if (!isGroupBCompleted) {
        groupBHeader.classList.add('active');
        console.log('🎬 Группа B: анимация ВКЛЮЧЕНА');
    } else {
        groupBHeader.classList.remove('active');
        console.log('⏸ Группа B: анимация ВЫКЛЮЧЕНА');
    }
}

// ==================== АНИМАЦИЯ ДЛЯ ПЛЕЙ-ОФФ ====================

function updatePlayoffAnimation() {
    const upperFinal = tournamentData.playoffs.upperFinal;
    const lowerSemi = tournamentData.playoffs.lowerSemi;
    const lowerFinal = tournamentData.playoffs.lowerFinal;
    const grandFinal = tournamentData.playoffs.grandFinal;
    
    function shouldBeActive(match) {
        if (!match) return false;
        const hasTwoTeams = match.team1 && match.team1 !== '' && match.team1 !== 'TBD' &&
                           match.team2 && match.team2 !== '' && match.team2 !== 'TBD';
        const noWinner = !match.winner || match.winner === '';
        return hasTwoTeams && noWinner;
    }
    
    const upperBracketHeader = document.querySelector('.upper-bracket h3');
    const lowerBracketHeader = document.querySelector('.lower-bracket h3');
    const finalBracketHeader = document.querySelector('.final-bracket h3');
    
    function ensureWrapper(header, bracketClass) {
        if (!header) return null;
        
        let wrapper = header.parentElement;
        if (!wrapper.classList.contains('playoff-bracket-header')) {
            wrapper = document.createElement('div');
            wrapper.className = 'playoff-bracket-header';
            header.parentNode.insertBefore(wrapper, header);
            wrapper.appendChild(header);
        }
        return wrapper;
    }
    
    if (upperBracketHeader) {
        const wrapper = ensureWrapper(upperBracketHeader, 'upper');
        if (shouldBeActive(upperFinal)) {
            wrapper.classList.add('active');
        } else {
            wrapper.classList.remove('active');
        }
    }
    
    if (lowerBracketHeader) {
        const wrapper = ensureWrapper(lowerBracketHeader, 'lower');
        const isActive = shouldBeActive(lowerSemi) || shouldBeActive(lowerFinal);
        if (isActive) {
            wrapper.classList.add('active');
        } else {
            wrapper.classList.remove('active');
        }
    }
    
    if (finalBracketHeader) {
        const wrapper = ensureWrapper(finalBracketHeader, 'final');
        if (shouldBeActive(grandFinal)) {
            wrapper.classList.add('active');
        } else {
            wrapper.classList.remove('active');
        }
    }
}

// ==================== ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ РАСПИСАНИЯ И ПРИЗОВ ====================

let originalScheduleData = {
    periodStart: '', periodEnd: '',
    qfStart: '', qfEnd: '',
    sfStart: '', sfEnd: '',
    final: '', prizePool: ''
};

let originalPrizeData = {1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: ''};

function saveOriginalSchedule() {
    originalScheduleData = {
        periodStart: scheduleData.periodStart || '',
        periodEnd: scheduleData.periodEnd || '',
        qfStart: scheduleData.qfStart || '',
        qfEnd: scheduleData.qfEnd || '',
        sfStart: scheduleData.sfStart || '',
        sfEnd: scheduleData.sfEnd || '',
        final: scheduleData.final || '',
        prizePool: scheduleData.prizePool || ''
    };
}

function saveOriginalPrizes() {
    for (let i = 1; i <= 8; i++) {
        originalPrizeData[i] = prizeData[i] || '';
    }
}

function checkScheduleChanges() {
    const periodStart = document.getElementById('edit-period-start')?.value || '';
    const periodEnd = document.getElementById('edit-period-end')?.value || '';
    const qfStart = document.getElementById('edit-qf-start')?.value || '';
    const qfEnd = document.getElementById('edit-qf-end')?.value || '';
    const sfStart = document.getElementById('edit-sf-start')?.value || '';
    const sfEnd = document.getElementById('edit-sf-end')?.value || '';
    const final = document.getElementById('edit-final')?.value || '';
    const prizePool = document.getElementById('edit-prize-pool')?.value || '';
    
    return periodStart !== originalScheduleData.periodStart ||
           periodEnd !== originalScheduleData.periodEnd ||
           qfStart !== originalScheduleData.qfStart ||
           qfEnd !== originalScheduleData.qfEnd ||
           sfStart !== originalScheduleData.sfStart ||
           sfEnd !== originalScheduleData.sfEnd ||
           final !== originalScheduleData.final ||
           prizePool !== originalScheduleData.prizePool;
}

function checkPrizesChanges() {
    for (let i = 1; i <= 8; i++) {
        const input = document.getElementById(`prize-${i}`);
        if (input) {
            const currentValue = input.value.trim();
            if (currentValue !== (originalPrizeData[i] || '')) {
                return true;
            }
        }
    }
    return false;
}

function updateScheduleButtonColor() {
    const btn = document.getElementById('save-schedule');
    if (btn) {
        if (checkScheduleChanges()) {
            btn.classList.add('has-changes');
        } else {
            btn.classList.remove('has-changes');
        }
    }
}

function updatePrizesButtonColor() {
    const btn = document.getElementById('save-prizes');
    if (btn) {
        if (checkPrizesChanges()) {
            btn.classList.add('has-changes');
        } else {
            btn.classList.remove('has-changes');
        }
    }
}

function initScheduleTracking() {
    saveOriginalSchedule();
    
    const fields = ['edit-period-start', 'edit-period-end', 'edit-qf-start', 'edit-qf-end', 
                    'edit-sf-start', 'edit-sf-end', 'edit-final', 'edit-prize-pool'];
    
    const onInputChange = () => {
        scheduleData.periodStart = document.getElementById('edit-period-start')?.value || '';
        scheduleData.periodEnd = document.getElementById('edit-period-end')?.value || '';
        scheduleData.qfStart = document.getElementById('edit-qf-start')?.value || '';
        scheduleData.qfEnd = document.getElementById('edit-qf-end')?.value || '';
        scheduleData.sfStart = document.getElementById('edit-sf-start')?.value || '';
        scheduleData.sfEnd = document.getElementById('edit-sf-end')?.value || '';
        scheduleData.final = document.getElementById('edit-final')?.value || '';
        scheduleData.prizePool = document.getElementById('edit-prize-pool')?.value || '';
        
        updateScheduleButtonColor();
    };
    
    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', onInputChange);
            element.addEventListener('change', onInputChange);
        }
    });
    
    updateScheduleButtonColor();
}

function initPrizesTracking() {
    saveOriginalPrizes();
    
    const onInputChange = () => {
        updatePrizesButtonColor();
    };
    
    for (let i = 1; i <= 8; i++) {
        const input = document.getElementById(`prize-${i}`);
        if (input) {
            input.addEventListener('input', onInputChange);
            input.addEventListener('change', onInputChange);
        }
    }
    
    updatePrizesButtonColor();
}

// ==================== ТАЙМЕР ====================
function startCountdownTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    const timerDiv = document.getElementById('countdown-timer');
    const timerSpan = document.getElementById('next-match-timer');
    if (!timerDiv || !timerSpan) return;

    function parseDate(dateStr) {
        if (!dateStr || dateStr === '—') return null;
        let dateTimeStr = dateStr;
        if (dateTimeStr.length === 16) {
            dateTimeStr = dateTimeStr + ':00';
        }
        const d = new Date(dateTimeStr + 'Z');
        return isNaN(d.getTime()) ? null : d;
    }

    function getNextMatchInfo() {
        const nowUTC = new Date();
        let nextMatch = null, nextDate = null;
        
        const qfDate = parseDate(scheduleData.qfStart);
        if (qfDate && qfDate > nowUTC && (!nextDate || qfDate < nextDate)) {
            nextDate = qfDate;
            nextMatch = { name: t('group_stage'), date: qfDate };
        }
        
        const sfDate = parseDate(scheduleData.sfStart);
        if (sfDate && sfDate > nowUTC && (!nextDate || sfDate < nextDate)) {
            nextDate = sfDate;
            nextMatch = { name: t('playoffs'), date: sfDate };
        }
        
        const finalDate = parseDate(scheduleData.final);
        if (finalDate && finalDate > nowUTC && (!nextDate || finalDate < nextDate)) {
            nextDate = finalDate;
            nextMatch = { name: t('grand_final'), date: finalDate };
        }
        
        return nextMatch;
    }

    function updateTimer() {
        const nextMatch = getNextMatchInfo();
        if (!nextMatch) {
            timerDiv.style.display = 'none';
            return;
        }

        const nowUTC = new Date();
        const diff = nextMatch.date - nowUTC;

        // Убираем двоеточие из названия, если оно есть
        let matchName = nextMatch.name.replace(/:$/, '');

        if (diff <= 0) {
            timerSpan.textContent = matchName + ' — ' + t('on_air');
            timerDiv.style.display = 'flex';
            return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        let timerText = '';
        if (days > 0) timerText += days + 'д ';
        if (hours > 0 || days > 0) timerText += hours + 'ч ';
        timerText += minutes + 'м ' + seconds + 'с';

        timerSpan.textContent = matchName + ': ' + timerText;
        timerDiv.style.display = 'flex';
    }
    
    updateTimer();
    updateGroupStageAnimation();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateDrawSectionVisibility() {
    const drawSection = document.querySelector('.draw-section');
    if (!drawSection) return;
    
    const hasTeamsInGroups = (tournamentData.groups.A.teams && tournamentData.groups.A.teams.length > 0) ||
                             (tournamentData.groups.B.teams && tournamentData.groups.B.teams.length > 0);
    
    const isDrawCompleted = (tournamentData.groups.A.teams && tournamentData.groups.A.teams.length === 4) &&
                            (tournamentData.groups.B.teams && tournamentData.groups.B.teams.length === 4);
    
    if (isDrawCompleted && hasTeamsInGroups) {
        drawSection.classList.add('hidden');
    } else {
        drawSection.classList.remove('hidden');
    }
}

async function loadDrawStatus() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getDrawStatus`);
        const data = await response.json();
        let drawCompleted = data.drawCompleted || false;
        
        const hasTeamsInGroups = (tournamentData.groups.A.teams && tournamentData.groups.A.teams.length > 0) ||
                                 (tournamentData.groups.B.teams && tournamentData.groups.B.teams.length > 0);
        
        const isDrawCompleted = drawCompleted || 
                                (tournamentData.groups.A.teams && tournamentData.groups.A.teams.length === 4 && 
                                 tournamentData.groups.B.teams && tournamentData.groups.B.teams.length === 4);
        
        const drawSection = document.querySelector('.draw-section');
        if (drawSection) {
            if (isDrawCompleted) {
                drawSection.classList.add('hidden');
                const saveDrawBtn = document.getElementById('save-draw');
                if (saveDrawBtn) saveDrawBtn.style.display = 'none';
            } else {
                drawSection.classList.remove('hidden');
            }
        }
        
        return isDrawCompleted;
    } catch (error) { 
        console.log('loadDrawStatus error:', error);
        return false; 
    }
}

async function loadTournamentData() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getTournamentData`);
        const data = await response.json();
        if (data && data.tournamentData) {
            const rawData = data.tournamentData;
            
            if (!rawData.groups) rawData.groups = { A: { teams: [], matches: [] }, B: { teams: [], matches: [] } };
            if (!rawData.groups.A) rawData.groups.A = { teams: [], matches: [] };
            if (!rawData.groups.B) rawData.groups.B = { teams: [], matches: [] };
            if (!rawData.groups.A.teams) rawData.groups.A.teams = [];
            if (!rawData.groups.B.teams) rawData.groups.B.teams = [];
            if (!rawData.groups.A.matches) rawData.groups.A.matches = [];
            if (!rawData.groups.B.matches) rawData.groups.B.matches = [];
            
            rawData.groups.A.teams = rawData.groups.A.teams.map(t => t === null || t === undefined ? '' : String(t));
            rawData.groups.B.teams = rawData.groups.B.teams.map(t => t === null || t === undefined ? '' : String(t));
            
            if (rawData.groups.A.matches) {
                rawData.groups.A.matches = rawData.groups.A.matches.filter(m => m && typeof m === 'object').map(m => ({
                    ...m,
                    team1: m.team1 ? String(m.team1) : 'TBD',
                    team2: m.team2 ? String(m.team2) : 'TBD',
                    winner: m.winner ? String(m.winner) : '',
                    streamUrl: m.streamUrl || '',
                    date: m.date || '',
                    score1: m.score1 || 0,
                    score2: m.score2 || 0,
                    points1: m.points1 || 0,
                    points2: m.points2 || 0
                }));
            }
            
            if (rawData.groups.B.matches) {
                rawData.groups.B.matches = rawData.groups.B.matches.filter(m => m && typeof m === 'object').map(m => ({
                    ...m,
                    team1: m.team1 ? String(m.team1) : 'TBD',
                    team2: m.team2 ? String(m.team2) : 'TBD',
                    winner: m.winner ? String(m.winner) : '',
                    streamUrl: m.streamUrl || '',
                    date: m.date || '',
                    score1: m.score1 || 0,
                    score2: m.score2 || 0,
                    points1: m.points1 || 0,
                    points2: m.points2 || 0
                }));
            }
            
            if (!rawData.playoffs) {
                rawData.playoffs = {};
            }
            
            const matches = ['upperFinal', 'lowerSemi', 'lowerFinal', 'grandFinal'];
            matches.forEach(match => {
                if (!rawData.playoffs[match]) {
                    rawData.playoffs[match] = {};
                }
                
                if (rawData.playoffs[match].team1 === 0 || rawData.playoffs[match].team1 === '0') {
                    rawData.playoffs[match].team1 = '';
                }
                if (rawData.playoffs[match].team2 === 0 || rawData.playoffs[match].team2 === '0') {
                    rawData.playoffs[match].team2 = '';
                }
                if (rawData.playoffs[match].winner === 0 || rawData.playoffs[match].winner === '0') {
                    rawData.playoffs[match].winner = '';
                }
                
                if (rawData.playoffs[match].date === 0 || rawData.playoffs[match].date === '0') {
                    rawData.playoffs[match].date = '';
                }
                if (rawData.playoffs[match].date && typeof rawData.playoffs[match].date === 'string') {
                    const dateMatch = rawData.playoffs[match].date.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}):(\d{2})/);
                    if (dateMatch) {
                        const [_, day, month, year, hours, minutes] = dateMatch;
                        const hh = hours.padStart(2, '0');
                        rawData.playoffs[match].date = `${year}-${month}-${day}T${hh}:${minutes}`;
                    }
                }
                
                if (rawData.playoffs[match].streamUrl === 0 || rawData.playoffs[match].streamUrl === '0') {
                    rawData.playoffs[match].streamUrl = '';
                }
                
                rawData.playoffs[match].team1Score = rawData.playoffs[match].team1Score || 0;
                rawData.playoffs[match].team2Score = rawData.playoffs[match].team2Score || 0;
                rawData.playoffs[match].team1Points = rawData.playoffs[match].team1Points || 0;
                rawData.playoffs[match].team2Points = rawData.playoffs[match].team2Points || 0;
            });
            
            tournamentData = rawData;

            const avatars = data.avatars || {};
            window.teamAvatars = avatars;
            console.log('Загружены аватары:', window.teamAvatars);

            window._originalGroupAMatches = JSON.parse(JSON.stringify(tournamentData.groups.A.matches || []));
            window._originalGroupBMatches = JSON.parse(JSON.stringify(tournamentData.groups.B.matches || []));
            window._originalPlayoffs = {
                upperFinal: JSON.parse(JSON.stringify(tournamentData.playoffs.upperFinal)),
                lowerSemi: JSON.parse(JSON.stringify(tournamentData.playoffs.lowerSemi)),
                lowerFinal: JSON.parse(JSON.stringify(tournamentData.playoffs.lowerFinal)),
                grandFinal: JSON.parse(JSON.stringify(tournamentData.playoffs.grandFinal))
            };

            tempPlayoffStreamUrls.upperFinal = tournamentData.playoffs.upperFinal?.streamUrl || '';
            tempPlayoffStreamUrls.lowerSemi = tournamentData.playoffs.lowerSemi?.streamUrl || '';
            tempPlayoffStreamUrls.lowerFinal = tournamentData.playoffs.lowerFinal?.streamUrl || '';
            tempPlayoffStreamUrls.grandFinal = tournamentData.playoffs.grandFinal?.streamUrl || '';

            tempPlayoffDates.upperFinal = tournamentData.playoffs.upperFinal?.date || '';
            tempPlayoffDates.lowerSemi = tournamentData.playoffs.lowerSemi?.date || '';
            tempPlayoffDates.lowerFinal = tournamentData.playoffs.lowerFinal?.date || '';
            tempPlayoffDates.grandFinal = tournamentData.playoffs.grandFinal?.date || '';

            console.log('Восстановлены данные плей-офф из Google Sheets:', { tempPlayoffStreamUrls, tempPlayoffDates });
            
            groupATeamsList = [...(tournamentData.groups.A.teams || [])];
            groupBTeamsList = [...(tournamentData.groups.B.teams || [])];
            
            groupATeamsList = groupATeamsList.filter(t => t && t !== '');
            groupBTeamsList = groupBTeamsList.filter(t => t && t !== '');
            
            tournamentData.groups.A.teams = groupATeamsList;
            tournamentData.groups.B.teams = groupBTeamsList;
            
            updateTeamsInputStatus();
            
            if (groupATeamsList.length === 4 && groupBTeamsList.length === 4) {
                currentDrawStep = 4;
                remainingTeamsAll = [];
            }
            
            renderGroups();
            renderPlayoffs();
            updateDrawStatus();
            updateDrawButtons();
            updatePlayoffsBracket();
            updatePlayoffAnimation();
            updateDrawSectionVisibility();
            updateGroupStageAnimation();
            return true;
        }
        return false;
    } catch (error) { 
        console.log('loadTournamentData error:', error);
        return false; 
    }
}

// ==================== ОБНОВЛЕНИЕ ПЛЕЙ-ОФФ ====================
function getGroupWinners(group) {
    const teams = group.teams || [];
    const matches = group.matches || [];
    const teamsWithStats = teams.map(teamName => {
        let wins = 0, totalPoints = 0;
        matches.forEach(match => {
            if (match.team1 === teamName && match.winner === teamName) { wins++; totalPoints += (match.points1 || 0); }
            if (match.team2 === teamName && match.winner === teamName) { wins++; totalPoints += (match.points2 || 0); }
        });
        return { name: teamName, wins: wins || 0, points: totalPoints || 0 };
    });
    teamsWithStats.sort((a, b) => b.wins - a.wins || b.points - a.points);
    return teamsWithStats;
}

function cleanTBDFromPlayoffs() {
    const playoffs = tournamentData.playoffs;
    
    if (!playoffs.upperFinal.winner) {
        if (playoffs.grandFinal.team1 === playoffs.upperFinal.team1 || 
            playoffs.grandFinal.team1 === playoffs.upperFinal.team2) {
            playoffs.grandFinal.team1 = '';
        }
        if (playoffs.lowerFinal.team1 === playoffs.upperFinal.team1 || 
            playoffs.lowerFinal.team1 === playoffs.upperFinal.team2) {
            playoffs.lowerFinal.team1 = '';
        }
    }
    
    if (!playoffs.lowerSemi.winner) {
        if (playoffs.lowerFinal.team2 === playoffs.lowerSemi.team1 || 
            playoffs.lowerFinal.team2 === playoffs.lowerSemi.team2) {
            playoffs.lowerFinal.team2 = '';
        }
    }
    
    if (!playoffs.lowerFinal.winner) {
        if (playoffs.grandFinal.team2 === playoffs.lowerFinal.team1 || 
            playoffs.grandFinal.team2 === playoffs.lowerFinal.team2) {
            playoffs.grandFinal.team2 = '';
        }
    }
    
    if (playoffs.upperFinal.team1 === 'TBD') playoffs.upperFinal.team1 = '';
    if (playoffs.upperFinal.team2 === 'TBD') playoffs.upperFinal.team2 = '';
    if (playoffs.upperFinal.winner === 'TBD') playoffs.upperFinal.winner = '';
    
    if (playoffs.lowerSemi.team1 === 'TBD') playoffs.lowerSemi.team1 = '';
    if (playoffs.lowerSemi.team2 === 'TBD') playoffs.lowerSemi.team2 = '';
    if (playoffs.lowerSemi.winner === 'TBD') playoffs.lowerSemi.winner = '';
    
    if (playoffs.lowerFinal.team1 === 'TBD') playoffs.lowerFinal.team1 = '';
    if (playoffs.lowerFinal.team2 === 'TBD') playoffs.lowerFinal.team2 = '';
    if (playoffs.lowerFinal.winner === 'TBD') playoffs.lowerFinal.winner = '';
    
    if (playoffs.grandFinal.team1 === 'TBD') playoffs.grandFinal.team1 = '';
    if (playoffs.grandFinal.team2 === 'TBD') playoffs.grandFinal.team2 = '';
    if (playoffs.grandFinal.winner === 'TBD') playoffs.grandFinal.winner = '';
}

function updatePlayoffsBracket() {
    console.log('=== updatePlayoffsBracket called ===');
    
    const savedDates = {
        upperFinal: tournamentData.playoffs.upperFinal?.date || '',
        lowerSemi: tournamentData.playoffs.lowerSemi?.date || '',
        lowerFinal: tournamentData.playoffs.lowerFinal?.date || '',
        grandFinal: tournamentData.playoffs.grandFinal?.date || ''
    };
    
    const savedStreamUrls = {
        upperFinal: tournamentData.playoffs.upperFinal?.streamUrl || '',
        lowerSemi: tournamentData.playoffs.lowerSemi?.streamUrl || '',
        lowerFinal: tournamentData.playoffs.lowerFinal?.streamUrl || '',
        grandFinal: tournamentData.playoffs.grandFinal?.streamUrl || ''
    };
    
    const savedScores = {
        upperFinal: { score1: tournamentData.playoffs.upperFinal?.team1Score || 0, score2: tournamentData.playoffs.upperFinal?.team2Score || 0 },
        lowerSemi: { score1: tournamentData.playoffs.lowerSemi?.team1Score || 0, score2: tournamentData.playoffs.lowerSemi?.team2Score || 0 },
        lowerFinal: { score1: tournamentData.playoffs.lowerFinal?.team1Score || 0, score2: tournamentData.playoffs.lowerFinal?.team2Score || 0 },
        grandFinal: { score1: tournamentData.playoffs.grandFinal?.team1Score || 0, score2: tournamentData.playoffs.grandFinal?.team2Score || 0 }
    };
    
    const savedPoints = {
        upperFinal: { points1: tournamentData.playoffs.upperFinal?.team1Points || 0, points2: tournamentData.playoffs.upperFinal?.team2Points || 0 },
        lowerSemi: { points1: tournamentData.playoffs.lowerSemi?.team1Points || 0, points2: tournamentData.playoffs.lowerSemi?.team2Points || 0 },
        lowerFinal: { points1: tournamentData.playoffs.lowerFinal?.team1Points || 0, points2: tournamentData.playoffs.lowerFinal?.team2Points || 0 },
        grandFinal: { points1: tournamentData.playoffs.grandFinal?.team1Points || 0, points2: tournamentData.playoffs.grandFinal?.team2Points || 0 }
    };
    
    const groupACompleted = isGroupStageCompleted('A');
    const groupBCompleted = isGroupStageCompleted('B');
    
    console.log('Group A completed:', groupACompleted);
    console.log('Group B completed:', groupBCompleted);
    
    const groupAWinners = getGroupWinners(tournamentData.groups.A);
    const groupBWinners = getGroupWinners(tournamentData.groups.B);
    
    console.log('Group A winners:', groupAWinners);
    console.log('Group B winners:', groupBWinners);
    
    cleanTBDFromPlayoffs();
    
    if (groupACompleted && groupAWinners[0] && groupAWinners[0].name) {
        tournamentData.playoffs.upperFinal.team1 = groupAWinners[0].name;
    } else if (!groupACompleted) {
        tournamentData.playoffs.upperFinal.team1 = '';
    }
    
    if (groupBCompleted && groupBWinners[0] && groupBWinners[0].name) {
        tournamentData.playoffs.upperFinal.team2 = groupBWinners[0].name;
    } else if (!groupBCompleted) {
        tournamentData.playoffs.upperFinal.team2 = '';
    }
    
    if (groupACompleted && groupAWinners[1] && groupAWinners[1].name) {
        tournamentData.playoffs.lowerSemi.team1 = groupAWinners[1].name;
    } else if (!groupACompleted) {
        tournamentData.playoffs.lowerSemi.team1 = '';
    }
    
    if (groupBCompleted && groupBWinners[1] && groupBWinners[1].name) {
        tournamentData.playoffs.lowerSemi.team2 = groupBWinners[1].name;
    } else if (!groupBCompleted) {
        tournamentData.playoffs.lowerSemi.team2 = '';
    }
    
    tournamentData.playoffs.upperFinal.date = savedDates.upperFinal || tempPlayoffDates.upperFinal;
    tournamentData.playoffs.upperFinal.team1Score = savedScores.upperFinal.score1;
    tournamentData.playoffs.upperFinal.team2Score = savedScores.upperFinal.score2;
    tournamentData.playoffs.upperFinal.team1Points = savedPoints.upperFinal.points1;
    tournamentData.playoffs.upperFinal.team2Points = savedPoints.upperFinal.points2;
    
    tournamentData.playoffs.lowerSemi.date = savedDates.lowerSemi || tempPlayoffDates.lowerSemi;
    tournamentData.playoffs.lowerSemi.team1Score = savedScores.lowerSemi.score1;
    tournamentData.playoffs.lowerSemi.team2Score = savedScores.lowerSemi.score2;
    tournamentData.playoffs.lowerSemi.team1Points = savedPoints.lowerSemi.points1;
    tournamentData.playoffs.lowerSemi.team2Points = savedPoints.lowerSemi.points2;
    
    tournamentData.playoffs.lowerFinal.date = savedDates.lowerFinal || tempPlayoffDates.lowerFinal;
    tournamentData.playoffs.lowerFinal.team1Score = savedScores.lowerFinal.score1;
    tournamentData.playoffs.lowerFinal.team2Score = savedScores.lowerFinal.score2;
    tournamentData.playoffs.lowerFinal.team1Points = savedPoints.lowerFinal.points1;
    tournamentData.playoffs.lowerFinal.team2Points = savedPoints.lowerFinal.points2;
    
    tournamentData.playoffs.grandFinal.date = savedDates.grandFinal || tempPlayoffDates.grandFinal;
    tournamentData.playoffs.grandFinal.team1Score = savedScores.grandFinal.score1;
    tournamentData.playoffs.grandFinal.team2Score = savedScores.grandFinal.score2;
    tournamentData.playoffs.grandFinal.team1Points = savedPoints.grandFinal.points1;
    tournamentData.playoffs.grandFinal.team2Points = savedPoints.grandFinal.points2;

    tournamentData.playoffs.upperFinal.streamUrl = savedStreamUrls.upperFinal || tempPlayoffStreamUrls.upperFinal;
    tournamentData.playoffs.lowerSemi.streamUrl = savedStreamUrls.lowerSemi || tempPlayoffStreamUrls.lowerSemi;
    tournamentData.playoffs.lowerFinal.streamUrl = savedStreamUrls.lowerFinal || tempPlayoffStreamUrls.lowerFinal;
    tournamentData.playoffs.grandFinal.streamUrl = savedStreamUrls.grandFinal || tempPlayoffStreamUrls.grandFinal;

    tempPlayoffDates.upperFinal = tournamentData.playoffs.upperFinal.date;
    tempPlayoffDates.lowerSemi = tournamentData.playoffs.lowerSemi.date;
    tempPlayoffDates.lowerFinal = tournamentData.playoffs.lowerFinal.date;
    tempPlayoffDates.grandFinal = tournamentData.playoffs.grandFinal.date;
    
    const upperFinal = tournamentData.playoffs.upperFinal;
    const lowerSemi = tournamentData.playoffs.lowerSemi;
    const lowerFinal = tournamentData.playoffs.lowerFinal;
    const grandFinal = tournamentData.playoffs.grandFinal;
    
    if (upperFinal.winner && upperFinal.winner !== '') {
        grandFinal.team1 = upperFinal.winner;
        console.log('Победитель верхнего финала идёт в гранд-финал:', upperFinal.winner);
        
        const upperLoser = upperFinal.team1 === upperFinal.winner ? upperFinal.team2 : upperFinal.team1;
        if (upperLoser && upperLoser !== '') {
            lowerFinal.team1 = upperLoser;
            console.log('Проигравший верхнего финала идёт в финал нижней сетки:', upperLoser);
        }
    }
    
    if (lowerSemi.winner && lowerSemi.winner !== '') {
        lowerFinal.team2 = lowerSemi.winner;
        console.log('Победитель полуфинала нижней сетки идёт в финал нижней сетки:', lowerSemi.winner);
    }
    
    if (lowerFinal.winner && lowerFinal.winner !== '') {
        grandFinal.team2 = lowerFinal.winner;
        console.log('Победитель финала нижней сетки идёт в гранд-финал:', lowerFinal.winner);
    }
    
    console.log('=== ТЕКУЩЕЕ СОСТОЯНИЕ ПЛЕЙ-ОФФ ===');
    console.log('UPPER FINAL:', tournamentData.playoffs.upperFinal.team1, 'vs', tournamentData.playoffs.upperFinal.team2, '| Победитель:', tournamentData.playoffs.upperFinal.winner, '| Дата:', tournamentData.playoffs.upperFinal.date);
    console.log('LOWER SEMI:', tournamentData.playoffs.lowerSemi.team1, 'vs', tournamentData.playoffs.lowerSemi.team2, '| Победитель:', tournamentData.playoffs.lowerSemi.winner, '| Дата:', tournamentData.playoffs.lowerSemi.date);
    console.log('LOWER FINAL:', tournamentData.playoffs.lowerFinal.team1, 'vs', tournamentData.playoffs.lowerFinal.team2, '| Победитель:', tournamentData.playoffs.lowerFinal.winner, '| Дата:', tournamentData.playoffs.lowerFinal.date);
    console.log('GRAND FINAL:', tournamentData.playoffs.grandFinal.team1, 'vs', tournamentData.playoffs.grandFinal.team2, '| Победитель:', tournamentData.playoffs.grandFinal.winner, '| Дата:', tournamentData.playoffs.grandFinal.date);
    
    renderPlayoffs();
    renderResults();
    updatePlayoffAnimation();
}

// ==================== ИНИЦИАЛИЗАЦИЯ МАТЧЕЙ ГРУПП ====================
function initGroupMatches() {
    const groupATeams = tournamentData.groups.A.teams || [];
    const groupBTeams = tournamentData.groups.B.teams || [];
    
    if (groupATeams.length === 4 && tournamentData.groups.A.matches.length === 0) {
        tournamentData.groups.A.matches = [
            { id: 1, team1: groupATeams[0], team2: groupATeams[1], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 1, streamUrl: '', date: '' },
            { id: 2, team1: groupATeams[2], team2: groupATeams[3], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 2, streamUrl: '', date: '' },
            { id: 3, team1: groupATeams[0], team2: groupATeams[2], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 3, streamUrl: '', date: '' },
            { id: 4, team1: groupATeams[1], team2: groupATeams[3], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 3, streamUrl: '', date: '' },
            { id: 5, team1: groupATeams[0], team2: groupATeams[3], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 4, streamUrl: '', date: '' },
            { id: 6, team1: groupATeams[1], team2: groupATeams[2], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 1, streamUrl: '', date: '' }
        ];
    }
    
    if (groupBTeams.length === 4 && tournamentData.groups.B.matches.length === 0) {
        tournamentData.groups.B.matches = [
            { id: 1, team1: groupBTeams[0], team2: groupBTeams[1], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 2, streamUrl: '', date: '' },
            { id: 2, team1: groupBTeams[2], team2: groupBTeams[3], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 1, streamUrl: '', date: '' },
            { id: 3, team1: groupBTeams[0], team2: groupBTeams[2], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 4, streamUrl: '', date: '' },
            { id: 4, team1: groupBTeams[1], team2: groupBTeams[3], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 4, streamUrl: '', date: '' },
            { id: 5, team1: groupBTeams[0], team2: groupBTeams[3], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 3, streamUrl: '', date: '' },
            { id: 6, team1: groupBTeams[1], team2: groupBTeams[2], score1: 0, score2: 0, points1: 0, points2: 0, winner: '', stream: 2, streamUrl: '', date: '' }
        ];
    }

    updateGroupStageAnimation();    
}

function getLiveStatus(matchDate, matchWinner) {
    if (!matchDate) return { isLive: false, isFinished: false };
    
    const now = new Date();
    const nowUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
    ));
    
    let matchTimeStr = matchDate;
    if (matchTimeStr.length === 16) {
        matchTimeStr = matchTimeStr + ':00';
    }
    const matchTime = new Date(matchTimeStr + 'Z');
    
    if (isNaN(matchTime.getTime())) return { isLive: false, isFinished: false };
    
    const diffMinutes = (nowUTC - matchTime) / (1000 * 60);
    
    if (matchTime > nowUTC) return { isLive: false, isFinished: false };
    if (diffMinutes < 60 && (!matchWinner || matchWinner === '')) return { isLive: true, isFinished: false };
    return { isLive: false, isFinished: true };
}

function getTeamRankings(group) {
    const teams = tournamentData.groups[group].teams || [];
    const matches = tournamentData.groups[group].matches || [];
    const teamsWithStats = teams.map(teamName => {
        if (!teamName || teamName === '') return { name: '—', wins: 0, points: 0 };
        
        let wins = 0, totalPoints = 0;
        matches.forEach(match => {
            if (match.team1 === teamName && match.winner === teamName) { wins++; totalPoints += (match.points1 || 0); }
            if (match.team2 === teamName && match.winner === teamName) { wins++; totalPoints += (match.points2 || 0); }
        });
        return { name: teamName, wins: wins || 0, points: totalPoints || 0 };
    }).filter(team => team.name !== '—');
    
    teamsWithStats.sort((a, b) => b.wins - a.wins || b.points - a.points);
    return teamsWithStats;
}

function getRankClass(rank) {
    if (rank === 0) return 'rank-1';
    if (rank === 1) return 'rank-2';
    return '';
}

// ==================== ПРОВЕРКА ЗАВЕРШЕНИЯ ТУРНИРА ====================
function isTournamentCompleted() {
    const grandFinal = tournamentData.playoffs.grandFinal;
    return grandFinal.winner && grandFinal.winner !== '' && grandFinal.winner !== 'TBD';
}

// ==================== ОТОБРАЖЕНИЕ РЕЗУЛЬТАТОВ ТУРНИРА ====================
function renderResults() {
    const resultsSection = document.querySelector('.results-section');
    const resultsList = document.getElementById('results-list');
    
    if (!resultsList) return;
    
    const tournamentCompleted = isTournamentCompleted();
    
    if (!tournamentCompleted) {
        if (resultsSection) resultsSection.style.display = 'none';
        return;
    }
    
    if (resultsSection) resultsSection.style.display = 'block';
    
    const teamStats = [];
    
    const processGroup = (groupName) => {
        const group = tournamentData.groups[groupName];
        if (!group || !group.teams) return;
        
        group.teams.forEach(teamName => {
            if (!teamName || teamName === '') return;
            
            let wins = 0;
            let totalPoints = 0;
            
            if (group.matches) {
                group.matches.forEach(match => {
                    if (match.team1 === teamName) {
                        totalPoints += (match.points1 || 0);
                        if (match.winner === teamName) wins++;
                    }
                    if (match.team2 === teamName) {
                        totalPoints += (match.points2 || 0);
                        if (match.winner === teamName) wins++;
                    }
                });
            }
            
            teamStats.push({
                name: teamName,
                wins: wins,
                points: totalPoints
            });
        });
    };
    
    processGroup('A');
    processGroup('B');
    
    const updateTeamStats = (teamName, winsToAdd, pointsToAdd) => {
        const team = teamStats.find(t => t.name === teamName);
        if (team) {
            team.wins += winsToAdd;
            team.points += pointsToAdd;
        }
    };
    
    const addLoserPoints = (match, loserTeamName) => {
        const team = teamStats.find(t => t.name === loserTeamName);
        if (team && match) {
            let loserPoints = 0;
            if (match.team1 === loserTeamName) {
                loserPoints = match.team1Points || 0;
            } else if (match.team2 === loserTeamName) {
                loserPoints = match.team2Points || 0;
            }
            team.points += loserPoints;
        }
    };
    
    const playoffs = tournamentData.playoffs;
    
    if (playoffs.upperFinal.team1 && playoffs.upperFinal.team1 !== 'TBD' && playoffs.upperFinal.team1 !== '') {
        if (playoffs.upperFinal.winner === playoffs.upperFinal.team1) {
            updateTeamStats(playoffs.upperFinal.team1, 1, playoffs.upperFinal.team1Points || 0);
            addLoserPoints(playoffs.upperFinal, playoffs.upperFinal.team2);
        } else if (playoffs.upperFinal.winner === playoffs.upperFinal.team2) {
            updateTeamStats(playoffs.upperFinal.team2, 1, playoffs.upperFinal.team2Points || 0);
            addLoserPoints(playoffs.upperFinal, playoffs.upperFinal.team1);
        } else if (!playoffs.upperFinal.winner) {
            updateTeamStats(playoffs.upperFinal.team1, 0, playoffs.upperFinal.team1Points || 0);
            updateTeamStats(playoffs.upperFinal.team2, 0, playoffs.upperFinal.team2Points || 0);
        }
    }
    
    if (playoffs.lowerSemi.team1 && playoffs.lowerSemi.team1 !== 'TBD' && playoffs.lowerSemi.team1 !== '') {
        if (playoffs.lowerSemi.winner === playoffs.lowerSemi.team1) {
            updateTeamStats(playoffs.lowerSemi.team1, 1, playoffs.lowerSemi.team1Points || 0);
            addLoserPoints(playoffs.lowerSemi, playoffs.lowerSemi.team2);
        } else if (playoffs.lowerSemi.winner === playoffs.lowerSemi.team2) {
            updateTeamStats(playoffs.lowerSemi.team2, 1, playoffs.lowerSemi.team2Points || 0);
            addLoserPoints(playoffs.lowerSemi, playoffs.lowerSemi.team1);
        } else if (!playoffs.lowerSemi.winner) {
            updateTeamStats(playoffs.lowerSemi.team1, 0, playoffs.lowerSemi.team1Points || 0);
            updateTeamStats(playoffs.lowerSemi.team2, 0, playoffs.lowerSemi.team2Points || 0);
        }
    }
    
    if (playoffs.lowerFinal.team1 && playoffs.lowerFinal.team1 !== 'TBD' && playoffs.lowerFinal.team1 !== '') {
        if (playoffs.lowerFinal.winner === playoffs.lowerFinal.team1) {
            updateTeamStats(playoffs.lowerFinal.team1, 1, playoffs.lowerFinal.team1Points || 0);
            addLoserPoints(playoffs.lowerFinal, playoffs.lowerFinal.team2);
        } else if (playoffs.lowerFinal.winner === playoffs.lowerFinal.team2) {
            updateTeamStats(playoffs.lowerFinal.team2, 1, playoffs.lowerFinal.team2Points || 0);
            addLoserPoints(playoffs.lowerFinal, playoffs.lowerFinal.team1);
        } else if (!playoffs.lowerFinal.winner) {
            updateTeamStats(playoffs.lowerFinal.team1, 0, playoffs.lowerFinal.team1Points || 0);
            updateTeamStats(playoffs.lowerFinal.team2, 0, playoffs.lowerFinal.team2Points || 0);
        }
    }
    
    if (playoffs.grandFinal.team1 && playoffs.grandFinal.team1 !== 'TBD' && playoffs.grandFinal.team1 !== '') {
        if (playoffs.grandFinal.winner === playoffs.grandFinal.team1) {
            updateTeamStats(playoffs.grandFinal.team1, 1, playoffs.grandFinal.team1Points || 0);
            addLoserPoints(playoffs.grandFinal, playoffs.grandFinal.team2);
        } else if (playoffs.grandFinal.winner === playoffs.grandFinal.team2) {
            updateTeamStats(playoffs.grandFinal.team2, 1, playoffs.grandFinal.team2Points || 0);
            addLoserPoints(playoffs.grandFinal, playoffs.grandFinal.team1);
        } else if (!playoffs.grandFinal.winner) {
            updateTeamStats(playoffs.grandFinal.team1, 0, playoffs.grandFinal.team1Points || 0);
            updateTeamStats(playoffs.grandFinal.team2, 0, playoffs.grandFinal.team2Points || 0);
        }
    }
    
    teamStats.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.points - a.points;
    });
    
    const grandFinalWinner = tournamentData.playoffs.grandFinal.winner;
    const grandFinalLoser = tournamentData.playoffs.grandFinal.team1 === grandFinalWinner ? 
        tournamentData.playoffs.grandFinal.team2 : tournamentData.playoffs.grandFinal.team1;
    
    if (grandFinalWinner && grandFinalWinner !== '' && grandFinalWinner !== 'TBD') {
        const winnerIndex = teamStats.findIndex(t => t.name === grandFinalWinner);
        if (winnerIndex > 0) {
            const winner = teamStats.splice(winnerIndex, 1)[0];
            teamStats.unshift(winner);
        }
    }
    
    if (grandFinalLoser && grandFinalLoser !== '' && grandFinalLoser !== 'TBD') {
        const loserIndex = teamStats.findIndex(t => t.name === grandFinalLoser);
        if (loserIndex > 0 && loserIndex !== 1) {
            const loser = teamStats.splice(loserIndex, 1)[0];
            teamStats.splice(1, 0, loser);
        }
    }
    
    let html = '';
    
    for (let i = 0; i < Math.min(teamStats.length, 8); i++) {
        const team = teamStats[i];
        const place = i + 1;
        const prize = prizeData[place] || '—';
        
        let rankClass = '';
        let medalIcon = '';
        
        if (place === 1) {
            rankClass = 'rank-1-row';
            medalIcon = '🏆';
        } else if (place === 2) {
            rankClass = 'rank-2-row';
            medalIcon = '🥈';
        } else if (place === 3) {
            rankClass = 'rank-3-row';
            medalIcon = '🥉';
        } else {
            rankClass = 'rank-other';
        }
        
        html += `
            <div class="result-row ${rankClass}">
                <div class="result-place">${place}</div>
                <div class="result-team">${getAvatarHtml(team.name)}${escapeHtml(team.name)}</div>
                <div class="result-wins">${team.wins}</div>
                <div class="result-points">${team.points.toLocaleString()}</div>
                <div class="result-prize">
                    ${escapeHtml(prize)} 
                    ${medalIcon ? `<span class="prize-icon">${medalIcon}</span>` : ''}
                </div>
            </div>
        `;
    }
    
    resultsList.innerHTML = html;
}

// ==================== ОТРИСОВКА ГРУПП ====================
function renderGroups() {
    const container = document.getElementById('groupsContainer');
    if (!container) return;
    
    if (!tournamentData || !tournamentData.groups) {
        container.innerHTML = '<div class="loading">Загрузка данных...</div>';
        return;
    }
    
    const groups = ['A', 'B'];
    container.innerHTML = groups.map(group => {
        if (!tournamentData.groups[group]) {
            return `<div class="group-card"><div class="group-header"><h3>${t('group')} ${group}</h3></div><div class="group-matches">${t('empty_content')}</div></div>`;
        }
        
        const rankings = getTeamRankings(group);
        const matches = tournamentData.groups[group].matches || [];
        const isGroupCompleted = isGroupStageCompleted(group);
        const hasTeams = tournamentData.groups[group].teams && tournamentData.groups[group].teams.length > 0;
        
        if (!hasTeams) {
            return `
                <div class="group-card">
                    <div class="group-header">
                        <h3>${t('group')} ${group}</h3>
                        <p>${t('waiting_draw')}</p>
                    </div>
                    <div class="group-placeholder">
                        <div class="placeholder-text">${t('placeholder_text')}</div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="group-card">
                <div class="group-header">
                    <h3>${t('group')} ${group}${isGroupCompleted ? ' ✓' : ''}</h3>
                    <p>${t('everyone_with_everyone')}</p>
                </div>
                <table class="group-teams-table">
                    <thead>
                        <tr>
                            <th style="text-align: left">${t('team_header')}</th>
                            <th style="text-align: center">${t('wins_header')}</th>
                            <th>${t('points_header')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rankings.map((team, idx) => {
                            if (!team || !team.name) return '';
                            const rankClass = getRankClass(idx);
                            const isEliminated = isGroupCompleted && idx >= 2;
                            const eliminationText = isEliminated ? ' — ' + t('eliminated') : '';
                            
                            return `
                                <tr class="${rankClass}">
                                    <td style="text-align: left; font-weight: 700; font-size: 0.95rem;">
                                        ${getAvatarHtml(team.name)}${escapeHtml(team.name)}${eliminationText}
                                    </td>
                                    <td style="text-align: center">
                                        <span class="${team.wins > 0 ? 'stat-wins' : 'stat-wins-zero'}">${team.wins}</span>
                                    </td>
                                    <td style="text-align: right; padding-right: 1rem;">
                                        <span class="stat-points">${(team.points || 0).toLocaleString()}</span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <div class="group-matches">
                    <div class="group-matches-header" id="group-${group}-matches-header">
                        <h4>${t('matches_header')} ${group}</h4>
                    </div>
                    <div class="matches-list">
                        ${matches.map((match, idx) => renderMatchCard(group, match, idx)).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    if (isAdmin) attachMatchHandlers();

    updateGroupStageAnimation();
}

function renderMatchCard(group, match, idx) {
    const safeMatch = {
        id: match.id,
        team1: match.team1 || 'TBD',
        team2: match.team2 || 'TBD',
        score1: match.score1 !== undefined ? match.score1 : 0,
        score2: match.score2 !== undefined ? match.score2 : 0,
        points1: match.points1 !== undefined ? match.points1 : 0,
        points2: match.points2 !== undefined ? match.points2 : 0,
        winner: match.winner || '',
        date: match.date || '',
        streamUrl: match.streamUrl || ''
    };

    const isCompleted = safeMatch.winner && safeMatch.winner !== '';
    
    const isWinner1 = safeMatch.winner === safeMatch.team1;
    const isWinner2 = safeMatch.winner === safeMatch.team2;
    const winnerClass1 = isWinner1 ? 'match-winner' : '';
    const winnerClass2 = isWinner2 ? 'match-winner' : '';
    
    const liveStatus = getLiveStatus(safeMatch.date, safeMatch.winner);
    const isLiveNow = liveStatus.isLive;
    
    const hasStreamUrl = safeMatch.streamUrl && safeMatch.streamUrl !== '';
    
    let liveBtnClass = '';
    if (!hasStreamUrl) {
        liveBtnClass = 'match-live-btn-finished';
    } else if (isLiveNow) {
        liveBtnClass = 'match-live-btn';
    } else {
        liveBtnClass = 'match-live-btn-dimmed';
    }
    
    const streamLink = hasStreamUrl ? safeMatch.streamUrl : '#';
    const pulseAnimation = (isLiveNow && hasStreamUrl) ? 'live-pulse' : '';
    
    const score1Class = safeMatch.score1 === 1 ? 'match-score-win' : 'match-score-loss';
    const score2Class = safeMatch.score2 === 1 ? 'match-score-win' : 'match-score-loss';
    
    const team1AvatarHtml = (safeMatch.team1 && safeMatch.team1 !== 'TBD') ? getAvatarHtml(safeMatch.team1) : '';
    const team2AvatarHtml = (safeMatch.team2 && safeMatch.team2 !== 'TBD') ? getAvatarHtml(safeMatch.team2) : '';
    
    const viewerHtml = `
        <div class="match-teams-row">
            <div class="match-team match-team-left ${winnerClass1}">
                ${team1AvatarHtml}
                <span class="match-team-name">${escapeHtml(safeMatch.team1)}</span>
            </div>
            <div class="match-vs ${isLiveNow ? 'match-vs-live' : ''}">${t('vs')}</div>
            <div class="match-team match-team-right ${winnerClass2}">
                <span class="match-team-name">${escapeHtml(safeMatch.team2)}</span>
                ${team2AvatarHtml}
            </div>
        </div>
        <div class="match-scores-row">
            <span class="match-score-left ${score1Class}">${safeMatch.score1}</span>
            <span class="match-score-divider">:</span>
            <span class="match-score-right ${score2Class}">${safeMatch.score2}</span>
        </div>
        <div class="match-points-row">
            <span class="match-points-left">${safeMatch.points1.toLocaleString()}</span>
            <span class="match-points-divider">:</span>
            <span class="match-points-right">${safeMatch.points2.toLocaleString()}</span>
        </div>
    `;
    
    const adminHtml = `
        <div class="match-teams-row">
            <div class="match-team match-team-left">
                <span class="match-team-name">${escapeHtml(safeMatch.team1)}</span>
            </div>
            <div class="match-vs">${t('vs')}</div>
            <div class="match-team match-team-right">
                <span class="match-team-name">${escapeHtml(safeMatch.team2)}</span>
            </div>
        </div>
        <div class="match-admin-controls">
            <div class="match-input-group">
                <span class="match-admin-label">${t('admin_score')} 1</span>
                <input type="number" id="${group}_score1_${safeMatch.id}" class="match-score-input" value="${safeMatch.score1}" min="0" max="1" step="1">
            </div>
            <div class="match-input-group">
                <span class="match-admin-label">${t('admin_score')} 2</span>
                <input type="number" id="${group}_score2_${safeMatch.id}" class="match-score-input" value="${safeMatch.score2}" min="0" max="1" step="1">
            </div>
            <div class="match-input-group">
                <span class="match-admin-label">${t('admin_points')} 1</span>
                <input type="number" id="${group}_points1_${safeMatch.id}" class="match-points-input" value="${safeMatch.points1}" min="0" max="100000" step="1">
            </div>
            <div class="match-input-group">
                <span class="match-admin-label">${t('admin_points')} 2</span>
                <input type="number" id="${group}_points2_${safeMatch.id}" class="match-points-input" value="${safeMatch.points2}" min="0" max="100000" step="1">
            </div>
            <div class="match-input-group">
                <span class="match-admin-label">${t('admin_date')}</span>
                <input type="datetime-local" id="${group}_date_${safeMatch.id}" class="match-date-input" value="${safeMatch.date ? formatDateForInput(safeMatch.date) : ''}">
            </div>
            <div class="match-input-group">
                <span class="match-admin-label">${t('admin_link')}</span>
                <input type="text" id="${group}_streamUrl_${safeMatch.id}" class="match-stream-input" placeholder="https://..." value="${escapeHtml(safeMatch.streamUrl)}">
            </div>
            <button class="match-update-btn" data-group="${group}" data-match-id="${safeMatch.id}">✓ ${t('admin_save')}</button>
        </div>
    `;
    
    return `
        <div class="match-card ${isCompleted ? 'completed' : ''}">
            <div class="match-info">
                <div class="match-datetime">${formatDateDisplay(safeMatch.date)}</div>
                <a href="${streamLink}" target="_blank" class="${liveBtnClass} ${pulseAnimation}">${t('live')}</a>
            </div>
            ${isAdmin ? adminHtml : viewerHtml}
        </div>
    `;
}

function attachMatchHandlers() {
    document.querySelectorAll('.match-update-btn').forEach(btn => {
        btn.removeEventListener('click', handleMatchUpdate);
        btn.addEventListener('click', handleMatchUpdate);
        
        const group = btn.dataset.group;
        const matchId = parseInt(btn.dataset.matchId);
        if (group && matchId) {
            trackMatchChanges(group, matchId);
        }
    });
    
    if (isAdmin) {
        document.querySelectorAll('.match-stream-input').forEach(input => {
            input.removeEventListener('change', handleStreamUrlChange);
            input.addEventListener('change', handleStreamUrlChange);
        });
        document.querySelectorAll('.match-date-input').forEach(input => {
            input.removeEventListener('change', handleDateChange);
            input.addEventListener('change', handleDateChange);
        });
    }
}

function handleDateChange(e) {
    const idParts = e.target.id.split('_');
    const group = idParts[0];
    const matchId = parseInt(idParts[2]);
    
    if (isNaN(matchId)) return;
    
    const matches = tournamentData.groups[group].matches;
    const matchIndex = matches.findIndex(m => m.id === matchId);
    
    if (matchIndex !== -1) {
        const newDate = e.target.value;
        if (newDate) {
            const dateObj = new Date(newDate);
            if (!isNaN(dateObj.getTime())) {
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                tournamentData.groups[group].matches[matchIndex].date = `${year}-${month}-${day}T${hours}:${minutes}`;
            }
        }
    }
}

function handleStreamUrlChange(e) {
    const idParts = e.target.id.split('_');
    const group = idParts[0];
    const matchId = parseInt(idParts[2]);
    
    if (isNaN(matchId)) return;
    
    const matches = tournamentData.groups[group].matches;
    const matchIndex = matches.findIndex(m => m.id === matchId);
    
    if (matchIndex !== -1) {
        tournamentData.groups[group].matches[matchIndex].streamUrl = e.target.value;
    }
}

function handleMatchUpdate(e) {
    const group = e.currentTarget.dataset.group;
    const matchId = parseInt(e.currentTarget.dataset.matchId);
    
    if (isNaN(matchId)) {
        console.error('Invalid match ID');
        return;
    }
    
    const matches = tournamentData.groups[group].matches;
    const matchIndex = matches.findIndex(m => m.id === matchId);
    
    if (matchIndex === -1) {
        console.error('Match not found:', matchId);
        return;
    }
    
    const score1Input = document.getElementById(`${group}_score1_${matchId}`);
    const score2Input = document.getElementById(`${group}_score2_${matchId}`);
    const points1Input = document.getElementById(`${group}_points1_${matchId}`);
    const points2Input = document.getElementById(`${group}_points2_${matchId}`);
    const dateInput = document.getElementById(`${group}_date_${matchId}`);
    const streamUrlInput = document.getElementById(`${group}_streamUrl_${matchId}`);
    
    if (!score1Input || !score2Input || !points1Input || !points2Input) {
        console.error('Input fields not found for match:', matchId);
        return;
    }
    
    let score1 = parseInt(score1Input.value) || 0;
    let score2 = parseInt(score2Input.value) || 0;
    const points1 = parseInt(points1Input.value) || 0;
    const points2 = parseInt(points2Input.value) || 0;
    
    score1 = Math.min(score1, 1);
    score2 = Math.min(score2, 1);
    
    if (dateInput && dateInput.value) {
        const dateObj = new Date(dateInput.value);
        if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            tournamentData.groups[group].matches[matchIndex].date = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }
    
    if (streamUrlInput) {
        tournamentData.groups[group].matches[matchIndex].streamUrl = streamUrlInput.value;
    }
    
    tournamentData.groups[group].matches[matchIndex].score1 = score1;
    tournamentData.groups[group].matches[matchIndex].score2 = score2;
    tournamentData.groups[group].matches[matchIndex].points1 = points1;
    tournamentData.groups[group].matches[matchIndex].points2 = points2;
    
    if (score1 > score2) {
        tournamentData.groups[group].matches[matchIndex].winner = tournamentData.groups[group].matches[matchIndex].team1;
    } else if (score2 > score1) {
        tournamentData.groups[group].matches[matchIndex].winner = tournamentData.groups[group].matches[matchIndex].team2;
    } else {
        tournamentData.groups[group].matches[matchIndex].winner = '';
    }
    
    saveMatchToSheet(group, matchId);
    
    updatePlayoffsBracket();
    renderGroups();
    renderPlayoffs();
    updateGroupStageAnimation();
    playSound('click');
}

async function saveMatchToSheet(group, matchId) {
    try {
        const matches = tournamentData.groups[group].matches;
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'tournament',
                data: JSON.stringify({ groups: tournamentData.groups, playoffs: tournamentData.playoffs })
            }).toString()
        });
        
        console.log(`Match ${group}_${matchId} saved to Google Sheets`);
        
        const updateBtn = document.querySelector(`.match-update-btn[data-group="${group}"][data-match-id="${matchId}"]`);
        if (updateBtn) updateBtn.classList.remove('has-changes');
        
    } catch(e) {
        console.error('Save match error:', e);
    }
}

// ==================== ОТРИСОВКА ПЛЕЙ-ОФФ ====================
function renderPlayoffMatchCard(match, matchId, extraClass = '') {
    const safeMatch = {
        team1: match.team1 || 'TBD',
        team2: match.team2 || 'TBD',
        team1Score: match.team1Score !== undefined ? match.team1Score : 0,
        team2Score: match.team2Score !== undefined ? match.team2Score : 0,
        team1Points: match.team1Points !== undefined ? match.team1Points : 0,
        team2Points: match.team2Points !== undefined ? match.team2Points : 0,
        winner: match.winner || '',
        date: match.date || '',
        streamUrl: match.streamUrl || ''
    };

    const isCompleted = safeMatch.winner && safeMatch.winner !== '';
    
    const isWinner1 = safeMatch.winner === safeMatch.team1;
    const isWinner2 = safeMatch.winner === safeMatch.team2;
    const winnerClass1 = isWinner1 ? 'playoff-winner-text' : '';
    const winnerClass2 = isWinner2 ? 'playoff-winner-text' : '';
    
    const isTBDTeam1 = safeMatch.team1 === 'TBD' || safeMatch.team1 === '';
    const isTBDTeam2 = safeMatch.team2 === 'TBD' || safeMatch.team2 === '';
    
    const score1Class = safeMatch.team1Score === 1 ? 'playoff-score-win' : 'playoff-score-loss';
    const score2Class = safeMatch.team2Score === 1 ? 'playoff-score-win' : 'playoff-score-loss';
    
    let effectiveDate = safeMatch.date;
    if (!effectiveDate && tempPlayoffDates[matchId]) {
        effectiveDate = tempPlayoffDates[matchId];
    }
    const showDate = effectiveDate && effectiveDate !== '' ? formatDateDisplay(effectiveDate) : t('date_not_set');
    
    let effectiveStreamUrl = safeMatch.streamUrl;
    if (!effectiveStreamUrl && tempPlayoffStreamUrls[matchId]) {
        effectiveStreamUrl = tempPlayoffStreamUrls[matchId];
    }
    const hasStreamUrl = effectiveStreamUrl && effectiveStreamUrl !== '';
    const streamLink = hasStreamUrl ? effectiveStreamUrl : '#';
    
    const liveStatus = getLiveStatus(effectiveDate, safeMatch.winner);
    const isLiveNow = liveStatus.isLive;
    
    let liveBtnClass = '';
    if (!hasStreamUrl) {
        liveBtnClass = 'match-live-btn-finished';
    } else if (isLiveNow) {
        liveBtnClass = 'match-live-btn';
    } else {
        liveBtnClass = 'match-live-btn-dimmed';
    }
    
    const pulseAnimation = (isLiveNow && hasStreamUrl) ? 'live-pulse' : '';
    const vsAnimationClass = isLiveNow ? 'match-vs-live' : '';
    
    const team1AvatarHtml = !isTBDTeam1 ? getAvatarHtml(safeMatch.team1) : '';
    const team2AvatarHtml = !isTBDTeam2 ? getAvatarHtml(safeMatch.team2) : '';
    
    const adminControls = isAdmin ? `
        <div class="playoff-admin-controls">
            <input type="number" id="${matchId}_score1" class="playoff-score-input" value="${safeMatch.team1Score}" min="0" max="1" step="1" placeholder="${t('admin_score1')}">
            <span style="color: #ccaa66;">:</span>
            <input type="number" id="${matchId}_score2" class="playoff-score-input" value="${safeMatch.team2Score}" min="0" max="1" step="1" placeholder="${t('admin_score2')}">
            <input type="number" id="${matchId}_points1" class="playoff-points-input" value="${safeMatch.team1Points}" min="0" max="100000" step="1" placeholder="${t('admin_points1')}">
            <span style="color: #ccaa66;">:</span>
            <input type="number" id="${matchId}_points2" class="playoff-points-input" value="${safeMatch.team2Points}" min="0" max="100000" step="1" placeholder="${t('admin_points2')}">
            <input type="datetime-local" id="${matchId}_date" class="match-date-input" value="${formatDateForInput(effectiveDate)}" style="width: 160px;">
            <input type="text" id="${matchId}_streamUrl" class="match-stream-input" placeholder="${t('admin_live_url')}" value="${escapeHtml(effectiveStreamUrl)}" style="width: 120px;">
            <button id="update-${matchId}" class="playoff-update-btn">${t('admin_save')}</button>
        </div>
    ` : '';
    
    const winnerHtml = (safeMatch.winner && !isTBDTeam1 && !isTBDTeam2) ? 
        `<div class="playoff-winner">${t('admin_winner')} ${escapeHtml(safeMatch.winner)}</div>` : '';
    
    return `
        <div class="playoff-match-card ${extraClass} ${isCompleted ? 'completed' : ''}">
            <div class="match-header">
                <span class="match-datetime">${showDate}</span>
                <a href="${streamLink}" target="_blank" class="live-btn ${liveBtnClass} ${pulseAnimation}">${t('live')}</a>
            </div>
            <div class="match-content">
                <div class="playoff-teams-row">
                    <div class="playoff-team playoff-team-left ${winnerClass1}">
                        ${team1AvatarHtml}
                        <span class="playoff-team-name ${isTBDTeam1 ? 'tbd-team' : ''}">${escapeHtml(safeMatch.team1)}</span>
                    </div>
                    <div class="playoff-vs ${vsAnimationClass}">${t('vs')}</div>
                    <div class="playoff-team playoff-team-right ${winnerClass2}">
                        <span class="playoff-team-name ${isTBDTeam2 ? 'tbd-team' : ''}">${escapeHtml(safeMatch.team2)}</span>
                        ${team2AvatarHtml}
                    </div>
                </div>
                <div class="playoff-scores-row">
                    <span class="playoff-score-left ${score1Class}">${safeMatch.team1Score}</span>
                    <span class="playoff-score-divider">:</span>
                    <span class="playoff-score-right ${score2Class}">${safeMatch.team2Score}</span>
                </div>
                <div class="playoff-points-row">
                    <span class="playoff-points-left">${safeMatch.team1Points.toLocaleString()}</span>
                    <span class="playoff-points-divider">:</span>
                    <span class="playoff-points-right">${safeMatch.team2Points.toLocaleString()}</span>
                </div>
                ${winnerHtml}
                ${adminControls}
            </div>
        </div>
    `;
}

function attachPlayoffHandlers() {
    const matches = ['upperFinal', 'lowerSemi', 'lowerFinal', 'grandFinal'];
    
    matches.forEach(matchId => {
        const updateBtn = document.getElementById(`update-${matchId}`);
        if (updateBtn) {
            updateBtn.removeEventListener('click', () => handlePlayoffUpdate(matchId));
            updateBtn.addEventListener('click', () => handlePlayoffUpdate(matchId));
            trackPlayoffChanges(matchId);
        }
    });
}

function handlePlayoffUpdate(matchId) {
    const score1Input = document.getElementById(`${matchId}_score1`);
    const score2Input = document.getElementById(`${matchId}_score2`);
    const points1Input = document.getElementById(`${matchId}_points1`);
    const points2Input = document.getElementById(`${matchId}_points2`);
    const dateInput = document.getElementById(`${matchId}_date`);
    const streamUrlInput = document.getElementById(`${matchId}_streamUrl`);
    
    if (!tournamentData.playoffs[matchId]) {
        tournamentData.playoffs[matchId] = {
            team1: 'TBD',
            team2: 'TBD',
            team1Score: 0,
            team2Score: 0,
            team1Points: 0,
            team2Points: 0,
            winner: '',
            date: '',
            streamUrl: ''
        };
    }
    
    if (score1Input && score2Input) {
        let score1 = parseInt(score1Input.value) || 0;
        let score2 = parseInt(score2Input.value) || 0;
        score1 = Math.min(score1, 1);
        score2 = Math.min(score2, 1);
        tournamentData.playoffs[matchId].team1Score = score1;
        tournamentData.playoffs[matchId].team2Score = score2;
    }
    
    if (points1Input && points2Input) {
        tournamentData.playoffs[matchId].team1Points = parseInt(points1Input.value) || 0;
        tournamentData.playoffs[matchId].team2Points = parseInt(points2Input.value) || 0;
    }
    
    if (dateInput && dateInput.value) {
        tournamentData.playoffs[matchId].date = dateInput.value;
        tempPlayoffDates[matchId] = dateInput.value;
    }
    
    if (streamUrlInput) {
        tournamentData.playoffs[matchId].streamUrl = streamUrlInput.value;
        tempPlayoffStreamUrls[matchId] = streamUrlInput.value;
    }
    
    if (tournamentData.playoffs[matchId].team1 && tournamentData.playoffs[matchId].team1 !== 'TBD' &&
        tournamentData.playoffs[matchId].team1 !== '' &&
        tournamentData.playoffs[matchId].team2 && tournamentData.playoffs[matchId].team2 !== 'TBD' &&
        tournamentData.playoffs[matchId].team2 !== '') {
        
        const score1 = tournamentData.playoffs[matchId].team1Score;
        const score2 = tournamentData.playoffs[matchId].team2Score;
        
        if (score1 > score2) {
            tournamentData.playoffs[matchId].winner = tournamentData.playoffs[matchId].team1;
        } else if (score2 > score1) {
            tournamentData.playoffs[matchId].winner = tournamentData.playoffs[matchId].team2;
        } else {
            tournamentData.playoffs[matchId].winner = '';
        }
    }
    
    savePlayoffToSheet(matchId);
    
    updatePlayoffsBracket();
    renderPlayoffs();
    updatePlayoffAnimation();
    
    playSound('click');
}

async function savePlayoffToSheet(matchId) {
    try {
        const playoffsToSave = {
            upperFinal: tournamentData.playoffs.upperFinal,
            lowerSemi: tournamentData.playoffs.lowerSemi,
            lowerFinal: tournamentData.playoffs.lowerFinal,
            grandFinal: tournamentData.playoffs.grandFinal
        };
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'tournament',
                data: JSON.stringify({ groups: tournamentData.groups, playoffs: playoffsToSave })
            }).toString()
        });
        
        console.log(`Playoff ${matchId} saved to Google Sheets`);
        
        const updateBtn = document.getElementById(`update-${matchId}`);
        if (updateBtn) updateBtn.classList.remove('has-changes');
        
    } catch(e) {
        console.error('Save playoff error:', e);
    }
}

function renderPlayoffs() {
    const upperBracketDiv = document.getElementById('upper-bracket-matches');
    const lowerSemiDiv = document.getElementById('lower-semi-match');
    const lowerFinalDiv = document.getElementById('lower-final-match');
    const finalDiv = document.getElementById('final-match');
    
    if (upperBracketDiv) {
        const upperFinal = tournamentData.playoffs.upperFinal;
        upperBracketDiv.innerHTML = renderPlayoffMatchCard(upperFinal, 'upperFinal', 'upper-final');
    }
    
    if (lowerSemiDiv) {
        const lowerSemi = tournamentData.playoffs.lowerSemi;
        lowerSemiDiv.innerHTML = renderPlayoffMatchCard(lowerSemi, 'lowerSemi', 'half-final');
    }
    
    if (lowerFinalDiv) {
        const lowerFinal = tournamentData.playoffs.lowerFinal;
        lowerFinalDiv.innerHTML = renderPlayoffMatchCard(lowerFinal, 'lowerFinal', 'lower-final');
    }
    
    if (finalDiv) {
        const grandFinal = tournamentData.playoffs.grandFinal;
        let html = renderPlayoffMatchCard(grandFinal, 'grandFinal', 'grand-final');
        
        if (grandFinal.winner && grandFinal.winner !== '' && grandFinal.winner !== 'TBD') {
            const championAvatar = getAvatarHtml(grandFinal.winner);
            html += `
                <div class="trophy-container">
                    <img src="image/GUP.png" alt="Champion Trophy" class="trophy-image" onclick="openTrophyModal()" style="cursor: pointer;">
                    <div class="winner-name">
                        <span class="winner-label">${t('champion')}</span>
                        ${championAvatar}
                        <span class="winner-team-name">${escapeHtml(grandFinal.winner)}</span>
                    </div>
                </div>
            `;
        }
        
        finalDiv.innerHTML = html;
    }
    
    if (isAdmin) attachPlayoffHandlers();
    
    updatePlayoffAnimation();
}

// ==================== ЖЕРЕБЬЁВКА ====================
function updateDrawButtons() {
    const btn1 = document.getElementById('draw-group-a1');
    const btn2 = document.getElementById('draw-group-b1');
    const btn3 = document.getElementById('draw-group-a2');
    const btn4 = document.getElementById('draw-group-b2');
    
    if (!isAdmin) {
        const allBtns = [btn1, btn2, btn3, btn4];
        allBtns.forEach(btn => { if (btn) btn.disabled = true; });
        return;
    }
    
    let allTeamsFilled = true;
    for (let i = 1; i <= 8; i++) {
        const input = document.getElementById(`team${i}`);
        if (!input || !input.value.trim()) {
            allTeamsFilled = false;
            break;
        }
    }
    
    if (!allTeamsFilled) {
        const allBtns = [btn1, btn2, btn3, btn4];
        allBtns.forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.classList.remove('active', 'completed', 'waiting');
                btn.classList.add('waiting');
            }
        });
        return;
    }
    
    if (btn1) {
        if (currentDrawStep >= 1) {
            btn1.classList.add('completed');
            btn1.classList.remove('active', 'waiting');
            btn1.disabled = true;
        } else {
            btn1.classList.add('active');
            btn1.classList.remove('completed', 'waiting');
            btn1.disabled = false;
        }
    }
    
    if (btn2) {
        if (currentDrawStep >= 2) {
            btn2.classList.add('completed');
            btn2.classList.remove('active', 'waiting');
            btn2.disabled = true;
        } else if (currentDrawStep >= 1) {
            btn2.classList.add('active');
            btn2.classList.remove('completed', 'waiting');
            btn2.disabled = false;
        } else {
            btn2.classList.add('waiting');
            btn2.classList.remove('active', 'completed');
            btn2.disabled = true;
        }
    }
    
    if (btn3) {
        if (currentDrawStep >= 3) {
            btn3.classList.add('completed');
            btn3.classList.remove('active', 'waiting');
            btn3.disabled = true;
        } else if (currentDrawStep >= 2) {
            btn3.classList.add('active');
            btn3.classList.remove('completed', 'waiting');
            btn3.disabled = false;
        } else {
            btn3.classList.add('waiting');
            btn3.classList.remove('active', 'completed');
            btn3.disabled = true;
        }
    }
    
    if (btn4) {
        if (currentDrawStep >= 4) {
            btn4.classList.add('completed');
            btn4.classList.remove('active', 'waiting');
            btn4.disabled = true;
        } else if (currentDrawStep >= 3) {
            btn4.classList.add('active');
            btn4.classList.remove('completed', 'waiting');
            btn4.disabled = false;
        } else {
            btn4.classList.add('waiting');
            btn4.classList.remove('active', 'completed');
            btn4.disabled = true;
        }
    }
}

function updateDrawStatus() {
    const statusDiv = document.getElementById('draw-status');
    if (!statusDiv) return;
    let html = `<strong>${t('draw_status_title')}</strong>`;
    html += `<div class="pair"><span class="pair-number">${t('draw_group_a_label')}</span> ${groupATeamsList.length ? groupATeamsList.join(', ') : t('draw_waiting_message')}</div>`;
    html += `<div class="pair"><span class="pair-number">${t('draw_group_b_label')}</span> ${groupBTeamsList.length ? groupBTeamsList.join(', ') : t('draw_waiting_message')}</div>`;
    html += `<p style="margin-top: 0.75rem; color: #ccaa66;">${t('draw_teams_left')} ${remainingTeamsAll.length}</p>`;
    if (currentDrawStep === 4) html += `<p style="margin-top: 0.75rem; color: #6aaf6a;">${t('draw_completed_message')}</p>`;
    statusDiv.innerHTML = html;
}

function performDrawToGroup(group, stepNumber) {
    console.log('=== performDrawToGroup ===', group, stepNumber);
    
    if (!isAdmin) { 
        showStatus('status_admin_required', 'error'); 
        playSound('error'); 
        return false; 
    }
    
    if (currentDrawStep === 4) {
        showStatus('status_draw_already_completed', 'error');
        playSound('error');
        return false;
    }
    
    if (stepNumber !== currentDrawStep + 1) {
        showStatus('status_wrong_turn', 'error');
        playSound('error');
        return false;
    }
    
    let btnSuffix = '';
    if (stepNumber === 1) btnSuffix = 'a1';
    else if (stepNumber === 2) btnSuffix = 'b1';
    else if (stepNumber === 3) btnSuffix = 'a2';
    else if (stepNumber === 4) btnSuffix = 'b2';
    const btnId = `draw-group-${btnSuffix}`;
    const btn = document.getElementById(btnId);
    console.log('Ищем кнопку:', btnId, 'найдена:', !!btn);
    
    if (stepNumber === 1 && remainingTeamsAll.length === 0) {
        console.log('Шаг 1: Инициализация');
        const teams = [];
        for (let i = 1; i <= 8; i++) {
            const input = document.getElementById(`team${i}`);
            const name = input ? input.value.trim() : '';
            if (!name) {
                showStatus('status_team_not_filled', 'error');
                playSound('error');
                return false;
            }
            teams.push(name);
        }
        remainingTeamsAll = shuffleArray([...teams]);
        groupATeamsList = [];
        groupBTeamsList = [];
        console.log('Команды перемешаны:', remainingTeamsAll);
    }
    
    if (remainingTeamsAll.length < 2) {
        showStatus('status_not_enough_teams', 'error');
        playSound('error');
        return false;
    }
    
    const team1 = remainingTeamsAll.shift();
    const team2 = remainingTeamsAll.shift();
    console.log(`Добавляем ${team1} и ${team2} в группу ${group}`);
    
    if (group === 'A') {
        groupATeamsList.push(team1, team2);
    } else {
        groupBTeamsList.push(team1, team2);
    }
    
    currentDrawStep = stepNumber;
    console.log(`Шаг ${stepNumber} выполнен. Осталось команд: ${remainingTeamsAll.length}`);
    
    if (btn) {
        btn.classList.remove('active', 'waiting');
        btn.classList.add('completed');
        btn.disabled = true;
    }
    
    let nextBtnId = null;
    if (stepNumber === 1) nextBtnId = 'draw-group-b1';
    else if (stepNumber === 2) nextBtnId = 'draw-group-a2';
    else if (stepNumber === 3) nextBtnId = 'draw-group-b2';
    
    if (nextBtnId) {
        const nextBtn = document.getElementById(nextBtnId);
        if (nextBtn) {
            nextBtn.classList.remove('waiting');
            nextBtn.classList.add('active');
            nextBtn.disabled = false;
            console.log(`Активирована кнопка: ${nextBtnId}`);
        }
    }
    
    updateTeamsInputStatus();
    updateDrawStatus();
    updateDrawButtons();
    
    if (groupATeamsList.length === 4 && groupBTeamsList.length === 4) {
        console.log('Жеребьёвка завершена!');
        tournamentData.groups.A.teams = [...groupATeamsList];
        tournamentData.groups.B.teams = [...groupBTeamsList];
        initGroupMatches();
        updatePlayoffsBracket();
        renderGroups();
        renderPlayoffs();
        updateTeamsInputStatus();
        currentDrawStep = 4;

        updateGroupStageAnimation();
        
        const saveDrawBtn = document.getElementById('save-draw');
        if (saveDrawBtn) {
            saveDrawBtn.style.display = 'inline-block';
            saveDrawBtn.classList.add('draw-save-ready');
        }
        
        showStatus('draw_completed_success', 'success');
        playSound('success');
    } else {
        showStatus('group_added_success', 'success');
        playSound('success');
    }
    
    return true;
}

async function saveDrawToSheet() {
    if (!isAdmin) { showStatus('status_admin_required', 'error'); playSound('error'); return; }
    if (currentDrawStep !== 4) { showStatus('status_draw_not_completed', 'error'); playSound('error'); return; }
    
    showStatus('status_saving_draw', 'success');
    
    try {
        const response1 = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'drawStatus',
                data: JSON.stringify({ drawCompleted: true })
            }).toString()
        });
        const result1 = await response1.json();
        console.log('Draw status saved:', result1);
        
        const response2 = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'tournament',
                data: JSON.stringify({ groups: tournamentData.groups, playoffs: tournamentData.playoffs })
            }).toString()
        });
        const result2 = await response2.json();
        console.log('Tournament saved:', result2);
        
        if (result1.success && result2.success) {
            playSound('success');
            showStatus('status_draw_saved', 'success');
            const drawSection = document.querySelector('.draw-section');
            if (drawSection) drawSection.classList.add('hidden');
            updateGroupStageAnimation();
        } else {
            showStatus('status_error', 'error');
            playSound('error');
        }
    } catch(e) {
        console.error('saveDrawToSheet error:', e);
        playSound('error');
        showStatus('status_error', 'error');
    }
}

function clearAllTeams() {
    if (!isAdmin) { showStatus('status_admin_required', 'error'); playSound('error'); return; }
    if (confirm(t('confirm_clear_teams'))) {
        playSound('click');
        
        for (let i = 1; i <= 8; i++) { 
            const input = document.getElementById(`team${i}`); 
            if (input) {
                input.value = '';
                input.classList.remove('used');
                input.disabled = false;
            }
        }
        
        remainingTeamsAll = [];
        groupATeamsList = [];
        groupBTeamsList = [];
        currentDrawStep = 0;
        tournamentData.groups.A.teams = [];
        tournamentData.groups.B.teams = [];
        tournamentData.groups.A.matches = [];
        tournamentData.groups.B.matches = [];
        tournamentData.playoffs = {
            upperFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
            lowerSemi: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
            lowerFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
            grandFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' }
        };
        
        const allBtns = ['draw-group-a1', 'draw-group-b1', 'draw-group-a2', 'draw-group-b2'];
        allBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.remove('completed', 'active', 'waiting');
                btn.classList.add('waiting');
                btn.disabled = true;
            }
        });
        
        const saveDrawBtn = document.getElementById('save-draw');
        if (saveDrawBtn) {
            saveDrawBtn.style.display = 'none';
            saveDrawBtn.classList.remove('draw-save-ready');
        }
        
        updateDrawStatus();
        renderGroups();
        renderPlayoffs();
        
        showStatus('status_cleared', 'success');
    }
}

function checkTeamsAndUpdateButtons() {
    if (!isAdmin) return;
    
    let allTeamsFilled = true;
    for (let i = 1; i <= 8; i++) {
        const input = document.getElementById(`team${i}`);
        if (!input || !input.value.trim()) {
            allTeamsFilled = false;
            break;
        }
    }
    
    if (allTeamsFilled && currentDrawStep === 0 && remainingTeamsAll.length === 0) {
        const btn1 = document.getElementById('draw-group-a1');
        if (btn1) {
            btn1.disabled = false;
            btn1.classList.remove('waiting', 'completed');
            btn1.classList.add('active');
        }
    } else if (!allTeamsFilled) {
        const allBtns = ['draw-group-a1', 'draw-group-b1', 'draw-group-a2', 'draw-group-b2'];
        allBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = true;
                btn.classList.remove('active', 'completed');
                btn.classList.add('waiting');
            }
        });
    }
    
    updateDrawButtons();
}

function updateTeamsInputStatus() {
    const distributedTeams = [...groupATeamsList, ...groupBTeamsList];
    const isDrawCompleted = (groupATeamsList.length === 4 && groupBTeamsList.length === 4);
    
    for (let i = 1; i <= 8; i++) {
        const input = document.getElementById(`team${i}`);
        if (!input) continue;
        
        const teamName = input.value.trim();
        
        if (isDrawCompleted) {
            input.readOnly = true;
            input.classList.add('used');
            const avatarInput = document.getElementById(`team${i}_avatar`);
            if (avatarInput) {
                avatarInput.readOnly = true;
            }
        } 
        else if (teamName && distributedTeams.includes(teamName)) {
            input.classList.add('used');
            input.disabled = true;
        } else {
            input.classList.remove('used');
            input.disabled = false;
            input.readOnly = false;
            const avatarInput = document.getElementById(`team${i}_avatar`);
            if (avatarInput) {
                avatarInput.readOnly = false;
            }
        }
    }
}

function resetDraw() {
    if (!isAdmin) { showStatus('status_admin_required', 'error'); playSound('error'); return; }
    if (confirm(t('confirm_reset_draw'))) {
        playSound('click');
        
        remainingTeamsAll = [];
        groupATeamsList = [];
        groupBTeamsList = [];
        currentDrawStep = 0;
        tournamentData.groups.A.teams = [];
        tournamentData.groups.B.teams = [];
        tournamentData.groups.A.matches = [];
        tournamentData.groups.B.matches = [];
        tournamentData.playoffs = {
            upperFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
            lowerSemi: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
            lowerFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
            grandFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' }
        };
        
        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'drawStatus',
                data: JSON.stringify({ drawCompleted: false })
            }).toString()
        }).catch(e => console.log('Reset draw status error:', e));
        
        fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'tournament',
                data: JSON.stringify({ groups: { A: { teams: [], matches: [] }, B: { teams: [], matches: [] } }, playoffs: tournamentData.playoffs })
            }).toString()
        }).catch(e => console.log('Reset tournament error:', e));
        
        const allBtns = ['draw-group-a1', 'draw-group-b1', 'draw-group-a2', 'draw-group-b2'];
        allBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.remove('completed', 'active', 'waiting');
                btn.classList.add('waiting');
                btn.disabled = true;
            }
        });
        
        const firstBtn = document.getElementById('draw-group-a1');
        if (firstBtn) {
            firstBtn.classList.remove('waiting');
            firstBtn.classList.add('active');
            firstBtn.disabled = false;
        }
        
        const saveDrawBtn = document.getElementById('save-draw');
        if (saveDrawBtn) {
            saveDrawBtn.style.display = 'none';
            saveDrawBtn.classList.remove('draw-save-ready');
        }
        
        for (let i = 1; i <= 8; i++) {
            const input = document.getElementById(`team${i}`);
            if (input) {
                input.classList.remove('used');
                input.disabled = false;
            }
        }
        
        updateDrawButtons();
        updateDrawStatus();
        renderGroups();
        renderPlayoffs();
        
        const drawSection = document.querySelector('.draw-section');
        if (drawSection) drawSection.classList.remove('hidden');
        
        showStatus('status_draw_reset', 'success');
    }
}

// ==================== ПОЛНЫЙ СБРОС ТУРНИРА ====================
async function fullResetTournament() {
    if (!isAdmin) { showStatus('status_admin_required', 'error'); playSound('error'); return; }
    if (confirm(t('confirm_full_reset'))) {
        showStatus('status_full_reset', 'success');
        
        tournamentData = {
            groups: { A: { teams: [], matches: [] }, B: { teams: [], matches: [] } },
            playoffs: {
                upperFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
                lowerSemi: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
                lowerFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' },
                grandFinal: { team1: '', team2: '', team1Score: 0, team2Score: 0, team1Points: 0, team2Points: 0, winner: '', date: '', streamUrl: '' }
            }
        };
        
        remainingTeamsAll = [];
        groupATeamsList = [];
        groupBTeamsList = [];
        currentDrawStep = 0;
        
        for (let i = 1; i <= 8; i++) { 
            const input = document.getElementById(`team${i}`); 
            if (input) input.value = '';
            const avatarInput = document.getElementById(`team${i}_avatar`);
            if (avatarInput) avatarInput.value = '';
        }
        
        window.teamAvatars = {};
        
        scheduleData = {
            periodStart: null, periodEnd: null,
            qfStart: null, qfEnd: null,
            sfStart: null, sfEnd: null,
            final: null,
            prizePool: ''
        };
        
        prizeData = {
            1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: ''
        };
        
        const periodStartEl = document.getElementById('tournament-period-start');
        const periodEndEl = document.getElementById('tournament-period-end');
        const qfStartEl = document.getElementById('qf-period-start');
        const qfEndEl = document.getElementById('qf-period-end');
        const sfStartEl = document.getElementById('sf-period-start');
        const sfEndEl = document.getElementById('sf-period-end');
        const finalEl = document.getElementById('final-datetime');
        const prizeEl = document.getElementById('prize-pool');
        
        if (periodStartEl) periodStartEl.textContent = '—';
        if (periodEndEl) periodEndEl.textContent = '—';
        if (qfStartEl) qfStartEl.textContent = '—';
        if (qfEndEl) qfEndEl.textContent = '—';
        if (sfStartEl) sfStartEl.textContent = '—';
        if (sfEndEl) sfEndEl.textContent = '—';
        if (finalEl) finalEl.textContent = '—';
        if (prizeEl) prizeEl.textContent = '—';
        
        for (let i = 1; i <= 8; i++) {
            const prizeInput = document.getElementById(`prize-${i}`);
            if (prizeInput) prizeInput.value = '';
        }
        
        for (let i = 1; i <= 8; i++) {
            const input = document.getElementById(`team${i}`);
            if (input) {
                input.classList.remove('used');
                input.disabled = false;
            }
        }
        
        const drawSection = document.querySelector('.draw-section');
        if (drawSection) drawSection.classList.remove('hidden');
        
        const saveDrawBtn = document.getElementById('save-draw');
        if (saveDrawBtn) saveDrawBtn.style.display = 'none';
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'drawStatus',
                data: JSON.stringify({ drawCompleted: false })
            }).toString()
        }).catch(e => console.log('Reset draw status error:', e));
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'tournament',
                data: JSON.stringify({ groups: { A: { teams: [], matches: [] }, B: { teams: [], matches: [] } }, playoffs: tournamentData.playoffs })
            }).toString()
        }).catch(e => console.log('Reset tournament error:', e));
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'schedule',
                data: JSON.stringify({ period: { start: '', end: '' }, qf: { start: '', end: '' }, sf: { start: '', end: '' }, final: '', prizePool: '' })
            }).toString()
        }).catch(e => console.log('Reset schedule error:', e));
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'prizes',
                data: JSON.stringify(prizeData)
            }).toString()
        }).catch(e => console.log('Reset prizes error:', e));
        
        const emptyAvatarsData = {};
        for (let i = 1; i <= 8; i++) {
            emptyAvatarsData[i] = { name: '', avatar: '' };
        }
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'saveAvatars',
                data: JSON.stringify(emptyAvatarsData)
            }).toString()
        }).catch(e => console.log('Reset avatars error:', e));
        
        renderGroups();
        renderPlayoffs();
        updateDrawButtons();
        updateDrawStatus();
        checkPastDates();
        
        playSound('success');
        showStatus('status_full_reset_done', 'success');
    }
}

// ==================== АДМИН-ПАНЕЛЬ ====================
function initAdmin() {
    const unlockBtn = document.getElementById('unlock-admin');
    const passInput = document.getElementById('admin-pass');
    const saveBtn = document.getElementById('save-changes');
    const fullResetBtn = document.getElementById('full-reset-btn');
    const body = document.body;
    
    if (!unlockBtn || !passInput) return;
    
    unlockBtn.addEventListener('click', async () => {
        const enteredPass = passInput.value;
        
        if (!enteredPass) {
            showStatus('status_enter_password', 'error');
            playSound('error');
            return;
        }
        
        try {
            showStatus('status_password_check', 'success');
            
            const response = await fetch(`${SCRIPT_URL}?action=checkPassword&pass=${encodeURIComponent(enteredPass)}`);
            const data = await response.json();
            
            if (data.success) {
                playSound('success');
                isAdmin = true;
                body.classList.remove('viewer-mode');
                body.classList.add('admin-mode');
                const adminControls = document.getElementById('admin-controls');
                const editScheduleBtn = document.getElementById('edit-schedule-btn');
                if (adminControls) adminControls.style.display = 'block';
                if (editScheduleBtn) editScheduleBtn.style.display = 'inline-block';
                updateDrawButtons();
                checkTeamsAndUpdateButtons();
                
                if (!document.getElementById('reset-draw-btn')) {
                    const resetDrawBtn = document.createElement('button');
                    resetDrawBtn.id = 'reset-draw-btn';
                    resetDrawBtn.className = 'btn-secondary';
                    resetDrawBtn.style.marginTop = '10px';
                    resetDrawBtn.style.width = '100%';
                    resetDrawBtn.textContent = t('admin_reset_draw');
                    resetDrawBtn.addEventListener('click', resetDraw);
                    const adminControlsDiv = document.getElementById('admin-controls');
                    if (adminControlsDiv) adminControlsDiv.appendChild(resetDrawBtn);
                }

                if (!document.getElementById('save-avatars')) {
                    const saveAvatarsBtn = document.createElement('button');
                    saveAvatarsBtn.id = 'save-avatars';
                    saveAvatarsBtn.className = 'btn-primary';
                    saveAvatarsBtn.style.marginTop = '10px';
                    saveAvatarsBtn.style.width = '100%';
                    saveAvatarsBtn.textContent = t('admin_save_avatars');
                    saveAvatarsBtn.addEventListener('click', saveAvatarsToSheet);
                    const adminControlsDiv = document.getElementById('admin-controls');
                    if (adminControlsDiv) adminControlsDiv.appendChild(saveAvatarsBtn);
                }

                const rulesModal = document.getElementById('rules-modal');
                const rulesAdminPanel = document.getElementById('rules-admin-panel');
                if (rulesModal && rulesModal.style.display === 'flex' && rulesAdminPanel) {
                    rulesAdminPanel.style.display = 'block';
                    if (typeof renderRulesAdminPanel === 'function') {
                        renderRulesAdminPanel();
                    }
                }
                
                showStatus('status_admin_activated', 'success');
                passInput.value = '';
                renderGroups();
                renderPlayoffs();
            } else {
                playSound('error');
                showStatus('status_wrong_password', 'error');
                passInput.value = '';
            }
        } catch (err) {
            console.error('Password check error:', err);
            playSound('error');
            showStatus('status_error', 'error');
            passInput.value = '';
        }
    });
    
    if (fullResetBtn) fullResetBtn.addEventListener('click', fullResetTournament);
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            console.log('Save button clicked, isAdmin:', isAdmin);
            
            if (!isAdmin) { 
                showStatus('status_admin_required', 'error'); 
                playSound('error'); 
                return; 
            }
            
            showStatus('status_saving_tournament', 'success');
            
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: 'tournament',
                        data: JSON.stringify({ groups: tournamentData.groups, playoffs: tournamentData.playoffs })
                    }).toString()
                });
                
                const result = await response.json();
                console.log('Save result:', result);
                
                if (result.success) {
                    playSound('success');
                    showStatus('status_tournament_saved', 'success');
                } else {
                    showStatus('status_error', 'error');
                    playSound('error');
                }
            } catch(e) {
                console.error('Save error:', e);
                playSound('error');
                showStatus('status_error', 'error');
            }
        });
    }
    
    const editScheduleBtn = document.getElementById('edit-schedule-btn');
    if (editScheduleBtn) {
        editScheduleBtn.addEventListener('click', () => {
            if (!isAdmin) {
                showStatus('status_auth_required', 'error');
                playSound('error');
                return;
            }
            const editor = document.getElementById('schedule-editor');
            if (editor) {
                fillScheduleEditor();
                editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
                if (editor.style.display === 'block') {
                    initScheduleTracking();
                }
            }
        });
    }
    
    const saveScheduleBtn = document.getElementById('save-schedule');
    if (saveScheduleBtn) {
        saveScheduleBtn.addEventListener('click', async () => {
            console.log('Save schedule button clicked, isAdmin:', isAdmin);
            
            if (!isAdmin) { 
                showStatus('status_admin_required', 'error'); 
                playSound('error'); 
                return; 
            }
            
            const periodStart = document.getElementById('edit-period-start')?.value || '';
            const periodEnd = document.getElementById('edit-period-end')?.value || '';
            const qfStart = document.getElementById('edit-qf-start')?.value || '';
            const qfEnd = document.getElementById('edit-qf-end')?.value || '';
            const sfStart = document.getElementById('edit-sf-start')?.value || '';
            const sfEnd = document.getElementById('edit-sf-end')?.value || '';
            const final = document.getElementById('edit-final')?.value || '';
            const prizePoolValue = document.getElementById('edit-prize-pool')?.value || '';
            
            const scheduleDataToSave = { 
                period: { start: periodStart, end: periodEnd }, 
                qf: { start: qfStart, end: qfEnd }, 
                sf: { start: sfStart, end: sfEnd }, 
                final: final, 
                prizePool: prizePoolValue 
            };
            
            console.log('Schedule data to save:', scheduleDataToSave);
            showStatus('status_saving_schedule', 'success');
            
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: 'schedule',
                        data: JSON.stringify(scheduleDataToSave)
                    }).toString()
                });
                
                const result = await response.json();
                console.log('Schedule save result:', result);
                
                if (result.success) {
                    playSound('success');
                    showStatus('status_schedule_saved', 'success');
                    
                    scheduleData.qfStart = qfStart;
                    scheduleData.qfEnd = qfEnd;
                    scheduleData.sfStart = sfStart;
                    scheduleData.sfEnd = sfEnd;
                    scheduleData.final = final;
                    scheduleData.prizePool = prizePoolValue;
                    scheduleData.periodStart = periodStart;
                    scheduleData.periodEnd = periodEnd;
                    
                    document.getElementById('qf-period-start').textContent = formatDateOnly(qfStart);
                    document.getElementById('qf-period-end').textContent = formatDateOnly(qfEnd);
                    document.getElementById('sf-period-start').textContent = formatDateOnly(sfStart);
                    document.getElementById('sf-period-end').textContent = formatDateOnly(sfEnd);
                    document.getElementById('final-datetime').textContent = formatDateTimeFull(final);
                    document.getElementById('tournament-period-start').textContent = formatDateOnly(periodStart);
                    document.getElementById('tournament-period-end').textContent = formatDateOnly(periodEnd);
                    document.getElementById('prize-pool').textContent = prizePoolValue || '—';
                    
                    startCountdownTimer();
                    checkPastDates();
                    updateGroupStageAnimation();

                    saveOriginalSchedule();
                    updateScheduleButtonColor();
                    
                    const editor = document.getElementById('schedule-editor');
                    if (editor) editor.style.display = 'none';
                } else {
                    showStatus('status_error', 'error');
                    playSound('error');
                }
            } catch(e) {
                console.error('Schedule save error:', e);
                showStatus('status_error', 'error');
                playSound('error');
            }
        });
    }
    
    const savePrizesBtn = document.getElementById('save-prizes');
    if (savePrizesBtn) {
        savePrizesBtn.addEventListener('click', savePrizes);
    }
    
    const exitBtn = document.getElementById('admin-exit-btn');
    if (exitBtn) {
        exitBtn.removeEventListener('click', exitAdminMode);
        exitBtn.addEventListener('click', exitAdminMode);
    }
}

// ==================== ЗАПУСК ====================
async function start() {
    const savedLang = localStorage.getItem('tournament_lang');
    if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
        currentLang = savedLang;
    }
    
    console.log('Call of Dragons Tournament Loaded');
    
    const langBtn = document.getElementById('lang-switch-btn');
    if (langBtn) {
        langBtn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
        langBtn.addEventListener('click', () => {
            const newLang = currentLang === 'ru' ? 'en' : 'ru';
            setLanguage(newLang);
        });
    }
    
    updateAllTexts();
    
    // ========== ТОЛЬКО 1 ЗАПРОС ВМЕСТО 5 ==========
    // Расписание грузится через API_KEY (отдельно, быстро)
    await loadSchedule();
    
    // ВСЕ ОСТАЛЬНЫЕ ДАННЫЕ - ОДНИМ ЗАПРОСОМ
    await loadAllDataWithCache();
    
    updateDrawSectionVisibility();
    updateGroupStageAnimation();
    updatePlayoffAnimation();
    
    const btnA1 = document.getElementById('draw-group-a1');
    const btnB1 = document.getElementById('draw-group-b1');
    const btnA2 = document.getElementById('draw-group-a2');
    const btnB2 = document.getElementById('draw-group-b2');
    if (btnA1) btnA1.addEventListener('click', () => performDrawToGroup('A', 1));
    if (btnB1) btnB1.addEventListener('click', () => performDrawToGroup('B', 2));
    if (btnA2) btnA2.addEventListener('click', () => performDrawToGroup('A', 3));
    if (btnB2) btnB2.addEventListener('click', () => performDrawToGroup('B', 4));
    
    const saveDrawBtn = document.getElementById('save-draw');
    if (saveDrawBtn) saveDrawBtn.addEventListener('click', saveDrawToSheet);
    
    const clearTeamsBtn = document.getElementById('clear-teams');
    if (clearTeamsBtn) clearTeamsBtn.addEventListener('click', clearAllTeams);
    
    const forceRefreshBtn = document.getElementById('force-refresh');
    if (forceRefreshBtn) forceRefreshBtn.addEventListener('click', () => {
        localStorage.removeItem(CACHE_KEY);
        location.reload();
    });
    
    for (let i = 1; i <= 8; i++) {
        const input = document.getElementById(`team${i}`);
        if (input) {
            input.addEventListener('input', checkTeamsAndUpdateButtons);
            input.addEventListener('change', checkTeamsAndUpdateButtons);
        }
    }
    
    initAdmin();
    initScheduleTracking();
    initPrizesTracking();
    updateDrawButtons();
    updateDrawStatus();
    startCountdownTimer();
    initRulesModal();
    initTrophyModal();

    window.addEventListener('load', () => {
        console.log('✅ Страница полностью загружена, карточки показаны');
    });
    
    document.body.addEventListener('click', () => { if (audioContext?.state === 'suspended') audioContext.resume(); }, { once: true });
}

function showAdminBlock() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.style.display = 'block';
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.innerHTML = t('admin_notification');
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 3000);
        adminPanel.scrollIntoView({ behavior: 'smooth' });
    }
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        showAdminBlock();
    }
});

function exitAdminMode() {
    if (!isAdmin) return;
    performExitActions();
}

function performExitActions() {
    playSound('click');
    
    isAdmin = false;
    
    const body = document.body;
    body.classList.remove('admin-mode');
    body.classList.add('viewer-mode');
    
    const editScheduleBtn = document.getElementById('edit-schedule-btn');
    if (editScheduleBtn) editScheduleBtn.style.display = 'none';
    
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.style.display = 'none';
    
    const adminControls = document.getElementById('admin-controls');
    if (adminControls) adminControls.style.display = 'none';
    
    renderGroups();
    renderPlayoffs();
    
    updateDrawButtons();
    
    showStatus('status_exit_admin', 'success');
}

function updateUTCTime() {
    const utcElement = document.getElementById('utc-time');
    const utcHeaderElement = document.getElementById('utc-time-header');
    
    const now = new Date();
    const day = String(now.getUTCDate()).padStart(2, '0');
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const year = now.getUTCFullYear();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    
    const timeString = `UTC: ${day}.${month}.${year} ${hours}:${minutes}`;
    
    if (utcElement) utcElement.innerHTML = timeString;
    if (utcHeaderElement) utcHeaderElement.innerHTML = timeString;
}

// ==================== РЕГЛАМЕНТ (МОДАЛЬНОЕ ОКНО) ====================

let rulesData = [];

async function loadRules() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getRules`);
        const data = await response.json();
        
        if (data.success && data.rules) {
            rulesData = data.rules;
            renderRulesModal();
        }
    } catch (error) {
        console.error('Load rules error:', error);
        const modalBody = document.getElementById('rules-modal-body');
        if (modalBody) {
            modalBody.innerHTML = `<div style="text-align: center; padding: 2rem; color: #888888;">${t('rules_load_error')}</div>`;
        }
    }
}

function renderRulesModal() {
    const container = document.getElementById('rules-modal-body');
    if (!container) return;
    
    if (!rulesData || rulesData.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #888888;">${t('empty_rules')}</div>`;
        return;
    }
    
    if (isAdmin) {
        renderRulesAdminPanel();
    } else {
        renderRulesViewer();
    }
}

function renderRulesViewer() {
    const container = document.getElementById('rules-modal-body');
    if (!container) return;
    
    let html = '';
    for (let i = 0; i < rulesData.length; i++) {
        const section = rulesData[i];
        const sectionId = `rules-section-${i}`;
        html += `
            <div class="rules-section" id="${sectionId}">
                <h3 onclick="window.toggleRulesSection('${sectionId}')">
                    ${escapeHtml(section.title)}
                    <span class="toggle-icon">▼</span>
                </h3>
                <div class="rules-content">
                    ${section.content || `<p>${t('empty_content')}</p>`}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    if (rulesData.length > 0) {
        const firstSection = document.getElementById('rules-section-0');
        if (firstSection) {
            firstSection.classList.add('open');
        }
    }
}

function renderRulesAdminPanel() {
    const container = document.getElementById('rules-modal-body');
    if (!container) return;
    
    if (!rulesData || rulesData.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 1rem; color: #888888;">${t('rules_empty_sections')}</div>`;
        return;
    }
    
    let html = '';
    for (let i = 0; i < rulesData.length; i++) {
        const section = rulesData[i];
        html += `
            <div class="rules-admin-section" data-order="${section.order}">
                <div class="rules-admin-header">
                    <div class="rules-admin-title">
                        <input type="text" class="rules-title-input" value="${escapeHtml(section.title)}" placeholder="${t('new_section_default')}">
                    </div>
                    <div class="rules-admin-actions">
                        <button class="btn-primary move-up" ${i === 0 ? 'disabled' : ''} title="Вверх">↑</button>
                        <button class="btn-primary move-down" ${i === rulesData.length - 1 ? 'disabled' : ''} title="Вниз">↓</button>
                        <button class="btn-danger delete-section" title="Удалить">🗑️</button>
                    </div>
                </div>
                <div class="rules-editor-toolbar">
                    <button type="button" class="format-bold" data-section="${section.order}" title="Жирный"><strong>B</strong></button>
                    <button type="button" class="format-italic" data-section="${section.order}" title="Курсив"><em>I</em></button>
                    <button type="button" class="format-strike" data-section="${section.order}" title="Зачёркнутый"><s>S</s></button>
                    <button type="button" class="format-color-gold" data-section="${section.order}" title="Золотой" style="color:#ccaa66;">🟡</button>
                    <button type="button" class="format-color-red" data-section="${section.order}" title="Красный" style="color:#cc3333;">🔴</button>
                    <button type="button" class="format-color-green" data-section="${section.order}" title="Зелёный" style="color:#6aaf6a;">🟢</button>
                    <button type="button" class="format-link" data-section="${section.order}" title="Добавить ссылку">🔗</button>
                    <button type="button" class="format-clear" data-section="${section.order}" title="Очистить форматирование">✖</button>
                </div>
                <div class="rules-admin-content">
                    <textarea class="rules-content-input" id="rules-content-${section.order}" placeholder="${t('new_content_default')}">${escapeHtml(section.content)}</textarea>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    document.querySelectorAll('#rules-modal-body .move-up').forEach(btn => {
        btn.removeEventListener('click', handleMoveUp);
        btn.addEventListener('click', handleMoveUp);
    });
    
    document.querySelectorAll('#rules-modal-body .move-down').forEach(btn => {
        btn.removeEventListener('click', handleMoveDown);
        btn.addEventListener('click', handleMoveDown);
    });
    
    document.querySelectorAll('#rules-modal-body .delete-section').forEach(btn => {
        btn.removeEventListener('click', handleDeleteSection);
        btn.addEventListener('click', handleDeleteSection);
    });
    
    attachFormattingHandlers();
}

function attachFormattingHandlers() {
    document.querySelectorAll('.format-bold').forEach(btn => {
        btn.removeEventListener('click', handleFormatBold);
        btn.addEventListener('click', handleFormatBold);
    });
    
    document.querySelectorAll('.format-italic').forEach(btn => {
        btn.removeEventListener('click', handleFormatItalic);
        btn.addEventListener('click', handleFormatItalic);
    });
    
    document.querySelectorAll('.format-strike').forEach(btn => {
        btn.removeEventListener('click', handleFormatStrike);
        btn.addEventListener('click', handleFormatStrike);
    });
    
    document.querySelectorAll('.format-color-gold').forEach(btn => {
        btn.removeEventListener('click', handleFormatColorGold);
        btn.addEventListener('click', handleFormatColorGold);
    });
    
    document.querySelectorAll('.format-color-red').forEach(btn => {
        btn.removeEventListener('click', handleFormatColorRed);
        btn.addEventListener('click', handleFormatColorRed);
    });
    
    document.querySelectorAll('.format-color-green').forEach(btn => {
        btn.removeEventListener('click', handleFormatColorGreen);
        btn.addEventListener('click', handleFormatColorGreen);
    });
    
    document.querySelectorAll('.format-link').forEach(btn => {
        btn.removeEventListener('click', handleFormatLink);
        btn.addEventListener('click', handleFormatLink);
    });
    
    document.querySelectorAll('.format-clear').forEach(btn => {
        btn.removeEventListener('click', handleFormatClear);
        btn.addEventListener('click', handleFormatClear);
    });
}

function getSelectedTextarea(sectionOrder) {
    return document.getElementById(`rules-content-${sectionOrder}`);
}

function wrapSelectedText(textarea, before, after) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
        const newText = textarea.value.substring(0, start) + before + selectedText + after + textarea.value.substring(end);
        textarea.value = newText;
        textarea.selectionStart = start;
        textarea.selectionEnd = end + before.length + after.length;
        textarea.focus();
    }
}

function handleFormatBold(e) {
    const sectionOrder = e.currentTarget.dataset.section;
    const textarea = getSelectedTextarea(sectionOrder);
    if (textarea) {
        wrapSelectedText(textarea, '<strong>', '</strong>');
    }
}

function handleFormatItalic(e) {
    const sectionOrder = e.currentTarget.dataset.section;
    const textarea = getSelectedTextarea(sectionOrder);
    if (textarea) {
        wrapSelectedText(textarea, '<em>', '</em>');
    }
}

function handleFormatStrike(e) {
    const sectionOrder = e.currentTarget.dataset.section;
    const textarea = getSelectedTextarea(sectionOrder);
    if (textarea) {
        wrapSelectedText(textarea, '<s>', '</s>');
    }
}

function handleFormatColorGold(e) {
    const sectionOrder = e.currentTarget.dataset.section;
    const textarea = getSelectedTextarea(sectionOrder);
    if (textarea) {
        wrapSelectedText(textarea, '<span style="color: #ccaa66;">', '</span>');
    }
}

function handleFormatColorRed(e) {
    const sectionOrder = e.currentTarget.dataset.section;
    const textarea = getSelectedTextarea(sectionOrder);
    if (textarea) {
        wrapSelectedText(textarea, '<span style="color: #cc3333;">', '</span>');
    }
}

function handleFormatColorGreen(e) {
    const sectionOrder = e.currentTarget.dataset.section;
    const textarea = getSelectedTextarea(sectionOrder);
    if (textarea) {
        wrapSelectedText(textarea, '<span style="color: #6aaf6a;">', '</span>');
    }
}

function handleFormatLink(e) {
    const sectionOrder = e.currentTarget.dataset.section;
    const textarea = getSelectedTextarea(sectionOrder);
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let url = prompt('Введите URL ссылки:', 'https://');
        if (url && url.trim() !== '') {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            let linkHtml = '';
            if (selectedText) {
                linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`;
            } else {
                linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            }
            
            const newText = textarea.value.substring(0, start) + linkHtml + textarea.value.substring(end);
            textarea.value = newText;
            textarea.focus();
        }
    }
}

function handleFormatClear(e) {
    const sectionOrder = e.currentTarget.dataset.section;
    const textarea = getSelectedTextarea(sectionOrder);
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        let selectedText = textarea.value.substring(start, end);
        
        selectedText = selectedText.replace(/<[^>]*>/g, '');
        
        const newText = textarea.value.substring(0, start) + selectedText + textarea.value.substring(end);
        textarea.value = newText;
        textarea.selectionStart = start;
        textarea.selectionEnd = start + selectedText.length;
        textarea.focus();
    }
}

function handleMoveUp(e) {
    const sectionDiv = e.target.closest('.rules-admin-section');
    const order = parseInt(sectionDiv.dataset.order);
    const index = rulesData.findIndex(r => r.order === order);
    if (index > 0) {
        [rulesData[index - 1], rulesData[index]] = [rulesData[index], rulesData[index - 1]];
        rulesData.forEach((r, idx) => r.order = idx + 1);
        renderRulesAdminPanel();
    }
}

function handleMoveDown(e) {
    const sectionDiv = e.target.closest('.rules-admin-section');
    const order = parseInt(sectionDiv.dataset.order);
    const index = rulesData.findIndex(r => r.order === order);
    if (index < rulesData.length - 1) {
        [rulesData[index + 1], rulesData[index]] = [rulesData[index], rulesData[index + 1]];
        rulesData.forEach((r, idx) => r.order = idx + 1);
        renderRulesAdminPanel();
    }
}

function handleDeleteSection(e) {
    if (confirm(t('confirm_delete_section'))) {
        const sectionDiv = e.target.closest('.rules-admin-section');
        const order = parseInt(sectionDiv.dataset.order);
        rulesData = rulesData.filter(r => r.order !== order);
        rulesData.forEach((r, idx) => r.order = idx + 1);
        renderRulesAdminPanel();
    }
}

function collectRulesFromAdmin() {
    const sections = document.querySelectorAll('#rules-modal-body .rules-admin-section');
    const newRules = [];
    sections.forEach((section, index) => {
        const titleInput = section.querySelector('.rules-title-input');
        const contentInput = section.querySelector('.rules-content-input');
        newRules.push({
            order: index + 1,
            title: titleInput ? titleInput.value.trim() : t('new_section_default'),
            content: contentInput ? contentInput.value : ''
        });
    });
    return newRules;
}

function addRulesSection() {
    const newOrder = rulesData.length + 1;
    rulesData.push({
        order: newOrder,
        title: t('new_section_default'),
        content: t('new_content_default')
    });
    renderRulesAdminPanel();
}

async function saveRulesToSheet() {
    const updatedRules = collectRulesFromAdmin();
    
    if (updatedRules.length === 0) {
        showRulesStatus(t('rules_save_empty_error'), 'error');
        return;
    }
    
    showRulesStatus(t('rules_saving'), 'success');
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'saveRules',
                data: JSON.stringify({ rules: updatedRules })
            }).toString()
        });
        
        const result = await response.json();
        
        if (result.success) {
            rulesData = updatedRules;
            renderRulesAdminPanel();
            showRulesStatus(t('rules_saved'), 'success');
        } else {
            showRulesStatus(t('status_error'), 'error');
        }
    } catch(e) {
        console.error('Save rules error:', e);
        showRulesStatus(t('status_error'), 'error');
    }
}

async function resetRulesToDefault() {
    if (confirm(t('confirm_reset_rules'))) {
        showRulesStatus(t('rules_resetting'), 'success');
        
        const defaultRules = [
            { order: 1, title: 'ОБЩИЕ ПОЛОЖЕНИЯ', content: '<p>Здесь будет текст общих положений турнира...</p>' },
            { order: 2, title: 'ПРАВИЛА ИГРЫ', content: '<p>Здесь будут правила игры...</p>' },
            { order: 3, title: 'СИСТЕМА НАБРАННЫХ ОЧКОВ', content: '<p>Здесь будет описание системы начисления очков...</p>' },
            { order: 4, title: 'РАСПИСАНИЕ МАТЧЕЙ', content: '<p>Здесь будет расписание матчей...</p>' },
            { order: 5, title: 'ПРИЗОВОЙ ФОНД', content: '<p>Здесь будет информация о призовом фонде...</p>' },
            { order: 6, title: 'ДИСКВАЛИФИКАЦИЯ И СПОРЫ', content: '<p>Здесь будут правила дисквалификации и разрешения споров...</p>' }
        ];
        
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    action: 'saveRules',
                    data: JSON.stringify({ rules: defaultRules })
                }).toString()
            });
            
            const result = await response.json();
            
            if (result.success) {
                rulesData = defaultRules;
                renderRulesAdminPanel();
                showRulesStatus(t('rules_reset_done'), 'success');
            } else {
                showRulesStatus(t('status_error'), 'error');
            }
        } catch(e) {
            console.error('Reset rules error:', e);
            showRulesStatus(t('status_error'), 'error');
        }
    }
}

function showRulesStatus(msg, type) {
    const statusDiv = document.getElementById('rules-status');
    if (!statusDiv) return;
    statusDiv.textContent = msg;
    statusDiv.className = `rules-status ${type}`;
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

window.toggleRulesSection = function(sectionId) {
    if (isAdmin) return;
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('open');
    }
}

function openRulesModal() {
    const modal = document.getElementById('rules-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const rulesAdminPanel = document.getElementById('rules-admin-panel');
        if (rulesAdminPanel) {
            rulesAdminPanel.style.display = isAdmin ? 'block' : 'none';
        }
        
        loadRules();
    }
}

function closeRulesModal() {
    const modal = document.getElementById('rules-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function initRulesModal() {
    const showBtn = document.getElementById('show-rules-btn');
    const closeBtn = document.querySelector('.rules-modal-close');
    const modal = document.getElementById('rules-modal');
    const addBtn = document.getElementById('add-rules-section');
    const saveBtn = document.getElementById('save-rules');
    const resetBtn = document.getElementById('reset-rules');
    
    if (showBtn) {
        showBtn.addEventListener('click', openRulesModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeRulesModal);
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', addRulesSection);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveRulesToSheet);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetRulesToDefault);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeRulesModal();
            }
        });
    }
}

// ==================== МОДАЛЬНОЕ ОКНО ТРОФЕЯ ====================

function openTrophyModal() {
    const modal = document.getElementById('trophy-modal');
    if (modal) {
        updateTrophyModalContent();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function updateTrophyModalContent() {
    const grandFinal = tournamentData.playoffs.grandFinal;
    const championName = grandFinal.winner;
    
    const championAvatarDiv = document.getElementById('trophy-champion-avatar');
    const championNameDiv = document.getElementById('trophy-champion-name');
    
    if (!championAvatarDiv || !championNameDiv) return;
    
    if (championName && championName !== '' && championName !== 'TBD') {
        const avatarUrl = window.teamAvatars ? window.teamAvatars[championName] : '';
        
        championAvatarDiv.innerHTML = '';
        
        const avatarImg = document.createElement('img');
        avatarImg.src = avatarUrl || '';
        avatarImg.alt = championName;
        avatarImg.className = 'team-avatar';
        if (!avatarUrl) {
            avatarImg.style.visibility = 'hidden';
        }
        avatarImg.onerror = function() {
            this.style.display = 'none';
        };
        championAvatarDiv.appendChild(avatarImg);
        
        championNameDiv.textContent = championName;
        championNameDiv.style.display = 'block';
        championNameDiv.style.textAlign = 'center';
        championNameDiv.style.width = '100%';
    } else {
        championAvatarDiv.innerHTML = '';
        championNameDiv.textContent = t('champion_text');
        championNameDiv.style.display = 'block';
        championNameDiv.style.textAlign = 'center';
        championNameDiv.style.width = '100%';
    }
}

function closeTrophyModal() {
    const modal = document.getElementById('trophy-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function initTrophyModal() {
    const modal = document.getElementById('trophy-modal');
    const closeBtn = document.querySelector('.trophy-modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTrophyModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeTrophyModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeTrophyModal();
            }
        });
    }
}

setInterval(updateUTCTime, 10000);
updateUTCTime();

window.addEventListener('DOMContentLoaded', start);