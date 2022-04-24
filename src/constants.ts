// Authors: Omar Muhammad

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600
export const level_1 = []
export const level_1_s = [[103,117], [103,149], [103,182], [205,0], [205,34], [205,68], [205,102], [205,135], [205,164], [205,198], [451,34], [451,68], [451, 102], [451, 134], [451, 166], [451, 198], [451, 230]]
export const level_2 = []
export const level_2_s = []
export const level_3 =  [[68,531], [92,517],[120,503], [140,491], [167, 480], [238,466], [306,451], [378,456], [0,346], [70, 346], [140,346], [210,346], [280, 346], [71,248], [140,248], [210, 248], [280, 248], [350,248], [304,175], [226,175], [149,175], [74,175], [75, 12], [88, 70], [162,70], [238,70], [316,70], [391,70], [466,70], [538, 83], [604, 97], [672,110], [696, 123], [719,134], [745, 147], [768, 161], [543,162], [566, 175], [590,188], [611,199], [634, 211], [697, 224], [757, 237], [822, 249], [468,247], [539,262], [605,276], [675,290], [698,302], [722,315], [749,327], [773, 341], [514,336], [539,349], [566, 363], [589, 376], [611, 388], [681, 401], [747,414], [818,428], [469,396], [490,409], [516,421], [539,433], [558,445], [622,456], [684,469], [749, 482], [817, 482], [885, 482], [953, 482], [1021,482], [1089, 482], [1157, 482], [1225, 482], [1210,428], [1189,414], [1161,401], [1138,389], [1115,377], [1046,363], [978,349], [907, 335], [988,250], [1010,262], [1035,275], [1056,287], [1079,298], [1141,311], [1202,324], [1268,336], [1213,248], [1190, 235], [1157,221], [1136,210],[1113, 197], [1044,184], [980,170], [908,156], [971,103], [1038,103], [1106,103], [1174,103], [1242,103] ]
export const level_3_s = [[456,83], [456, 151], [456, 219], [456,287], [456,355], [894,0], [894,68], [894, 136], [894, 204], [894, 272], [894, 340], [1339,117], [1339, 185], [1339, 253], [1339, 321], [1339, 389]]

export interface Keys extends Phaser.Types.Input.Keyboard.CursorKeys {
    enter: Phaser.Input.Keyboard.Key
}
